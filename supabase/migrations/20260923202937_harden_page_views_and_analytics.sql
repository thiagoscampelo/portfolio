-- ═══════════════════════════════════════════════════════════════
-- S1 + S2 — Hardening de page_views e RPCs de analytics.
--
-- S1 (integridade):
--   - CHECK constraints em page_views para limitar o que entra.
--   - Defesa em profundidade: RLS decide QUEM escreve; CHECK limita
--     O QUE pode ser escrito. Sem os CHECKs, um portador da chave
--     pública pode gravar strings de tamanho arbitrário — a retenção
--     de 180 dias não protege contra uma rajada que encha o banco.
--
-- S2 (superfície de execução):
--   - REVOKE EXECUTE das 6 RPCs de analytics de PUBLIC e anon.
--   - GRANT EXECUTE para authenticated (a RLS em page_views continua
--     sendo a autoridade final sobre quem lê o quê — usuário
--     autenticado não-admin chama e recebe 0 linhas).
--   - Clamp de p_days (1..365) e p_limit (1..100) DENTRO das funções.
--     Sem isso, analytics_daily_views roda generate_series a partir
--     de p_days sem teto — a computação acontece mesmo sem dados.
--
-- Não coberto aqui:
--   - CSV injection em exportCsv.ts (patch frontend separado).
--   - Clip de tamanho em usePageTracking (defensivo, opcional).
--   - Storage: file_size_limit e allowed_mime_types (S3).
--
-- Notas de segurança:
--   - As RPCs continuam LANGUAGE sql / STABLE / invoker — sem
--     SECURITY DEFINER. A autorização real mora na RLS.
--   - is_admin() NÃO é revogada: é chamada dentro das policies por
--     anon também, e revogar quebraria a RLS.
-- ═══════════════════════════════════════════════════════════════


-- ─────────── Bloco 1 — CHECK constraints em page_views ───────────
--
-- Limites escolhidos:
--   path        1..512   — rotas reais do app não passam de ~120 chars;
--                          512 dá folga para query strings ocasionais.
--   referrer    0..2048  — URLs do Google/UTM podem ser longas.
--   user_agent  0..512   — UAs reais ficam em 80..300 chars; 512 é teto.
--   session_id  8..128   — UUID=36, fallback base36 ~25. 8 é o piso seguro.
--   device      enum     — coincide com o que usePageTracking envia.
--   path format          — barra inicial: rejeita strings de fórmula
--                          (ex: "=HYPERLINK(...)") antes do export CSV.
--
-- O que NÃO dá para validar só com CHECK:
--   - Se path é uma rota real (exigiria tabela de rotas).
--   - Se referrer é uma URL bem-formada (Postgres não valida URL nativo).
--   - Se session_id foi gerado por nós ou forjado.
--   - Rate limit / tamanho de payload por janela (exige app ou Edge Function).

ALTER TABLE public.page_views
  ADD CONSTRAINT page_views_path_format
    CHECK (path LIKE '/%'),
  ADD CONSTRAINT page_views_path_len
    CHECK (char_length(path) BETWEEN 1 AND 512),
  ADD CONSTRAINT page_views_referrer_len
    CHECK (referrer IS NULL OR char_length(referrer) <= 2048),
  ADD CONSTRAINT page_views_user_agent_len
    CHECK (user_agent IS NULL OR char_length(user_agent) <= 512),
  ADD CONSTRAINT page_views_session_id_len
    CHECK (char_length(session_id) BETWEEN 8 AND 128),
  ADD CONSTRAINT page_views_device_valid
    CHECK (device IS NULL OR device IN ('mobile', 'tablet', 'desktop', 'unknown'));


-- ─────────── Bloco 2 — RPCs redefinidas com clamp ───────────
--
-- CREATE OR REPLACE preserva o OID — os GRANT/REVOKE abaixo aplicam
-- sobre a mesma função. Ordem: redefinir → revogar/conceder.

-- ── analytics_overview ──
CREATE OR REPLACE FUNCTION public.analytics_overview(p_days int DEFAULT 30)
RETURNS TABLE (
  total_views     bigint,
  total_visitors  bigint,
  period_views    bigint,
  period_visitors bigint,
  today_views     bigint,
  today_visitors  bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH
    p            AS (SELECT LEAST(GREATEST(p_days, 1), 365) AS days),
    period_start AS (SELECT now() - ((SELECT days FROM p) || ' days')::interval AS ts),
    today_start  AS (SELECT date_trunc('day', now()) AS ts)
  SELECT
    (SELECT count(*) FROM page_views)::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views)::bigint,
    (SELECT count(*) FROM page_views WHERE created_at >= (SELECT ts FROM period_start))::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views WHERE created_at >= (SELECT ts FROM period_start))::bigint,
    (SELECT count(*) FROM page_views WHERE created_at >= (SELECT ts FROM today_start))::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views WHERE created_at >= (SELECT ts FROM today_start))::bigint;
$$;

-- ── analytics_top_pages ──
CREATE OR REPLACE FUNCTION public.analytics_top_pages(
  p_days  int DEFAULT 30,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  path            text,
  views           bigint,
  unique_visitors bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH p AS (
    SELECT
      LEAST(GREATEST(p_days, 1), 365)   AS days,
      LEAST(GREATEST(p_limit, 1), 100)  AS lim
  )
  SELECT
    path,
    count(*)::bigint                    AS views,
    count(DISTINCT session_id)::bigint  AS unique_visitors
  FROM page_views
  WHERE created_at >= now() - ((SELECT days FROM p) || ' days')::interval
  GROUP BY path
  ORDER BY views DESC
  LIMIT (SELECT lim FROM p);
$$;

-- ── analytics_top_referrers ──
CREATE OR REPLACE FUNCTION public.analytics_top_referrers(
  p_days  int DEFAULT 30,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  referrer text,
  views    bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH p AS (
    SELECT
      LEAST(GREATEST(p_days, 1), 365)   AS days,
      LEAST(GREATEST(p_limit, 1), 100)  AS lim
  )
  SELECT
    referrer,
    count(*)::bigint AS views
  FROM page_views
  WHERE created_at >= now() - ((SELECT days FROM p) || ' days')::interval
    AND referrer IS NOT NULL
    AND referrer <> ''
  GROUP BY referrer
  ORDER BY views DESC
  LIMIT (SELECT lim FROM p);
$$;

-- ── analytics_daily_views ──
CREATE OR REPLACE FUNCTION public.analytics_daily_views(p_days int DEFAULT 30)
RETURNS TABLE (
  day             date,
  views           bigint,
  unique_visitors bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH
    p AS (SELECT LEAST(GREATEST(p_days, 1), 365) AS days),
    days AS (
      SELECT generate_series(
        date_trunc('day', now()) - (((SELECT days FROM p) - 1) || ' days')::interval,
        date_trunc('day', now()),
        '1 day'::interval
      )::date AS day
    )
  SELECT
    d.day,
    COALESCE(count(pv.id), 0)::bigint                  AS views,
    COALESCE(count(DISTINCT pv.session_id), 0)::bigint AS unique_visitors
  FROM days d
  LEFT JOIN page_views pv
    ON date_trunc('day', pv.created_at)::date = d.day
  GROUP BY d.day
  ORDER BY d.day;
$$;

-- ── analytics_device_split ──
CREATE OR REPLACE FUNCTION public.analytics_device_split(p_days int DEFAULT 30)
RETURNS TABLE (
  device text,
  views  bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH p AS (SELECT LEAST(GREATEST(p_days, 1), 365) AS days)
  SELECT
    COALESCE(device, 'unknown') AS device,
    count(*)::bigint            AS views
  FROM page_views
  WHERE created_at >= now() - ((SELECT days FROM p) || ' days')::interval
  GROUP BY device
  ORDER BY views DESC;
$$;

-- ── analytics_compare ──
CREATE OR REPLACE FUNCTION public.analytics_compare(p_days int DEFAULT 30)
RETURNS TABLE (
  current_views     bigint,
  previous_views    bigint,
  current_visitors  bigint,
  previous_visitors bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH
    p AS (SELECT LEAST(GREATEST(p_days, 1), 365) AS days),
    windows AS (
      SELECT
        now() - (((SELECT days FROM p))      || ' days')::interval AS current_start,
        now() - (((SELECT days FROM p) * 2)  || ' days')::interval AS previous_start
    )
  SELECT
    (SELECT count(*) FROM page_views
       WHERE created_at >= (SELECT current_start FROM windows)
    )::bigint,
    (SELECT count(*) FROM page_views
       WHERE created_at >= (SELECT previous_start FROM windows)
         AND created_at <  (SELECT current_start FROM windows)
    )::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views
       WHERE created_at >= (SELECT current_start FROM windows)
    )::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views
       WHERE created_at >= (SELECT previous_start FROM windows)
         AND created_at <  (SELECT current_start FROM windows)
    )::bigint;
$$;


-- ─────────── Bloco 3 — REVOKE / GRANT das RPCs ───────────
--
-- Por padrão, Postgres concede EXECUTE a PUBLIC em toda função nova.
-- Revogamos de PUBLIC e de anon, e concedemos apenas a authenticated.
-- Usuário authenticated não-admin chama a função, mas a RLS em
-- page_views filtra tudo — recebe 0 linhas, sem erro.

REVOKE EXECUTE ON FUNCTION public.analytics_overview(int)         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_top_pages(int, int)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_top_referrers(int, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_daily_views(int)      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_device_split(int)     FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_compare(int)          FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.analytics_overview(int)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_top_pages(int, int)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_top_referrers(int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_daily_views(int)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_device_split(int)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_compare(int)          TO authenticated;


-- ─────────── Bloco 4 — Regerar tipos ───────────
-- Lembrete fora da migration: após aplicar, rode
--   pnpm dlx supabase gen types typescript --linked > src/lib/database.types.ts
-- Nada muda na assinatura das RPCs, então provavelmente o diff é vazio.
-- Mesmo assim, mantenha o hábito para não acumular divergência.