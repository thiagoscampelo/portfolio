-- ═══════════════════════════════════════════════════════════════
-- Funções de agregação para o dashboard de analytics.
--
-- Notas de segurança:
-- - NÃO usam SECURITY DEFINER — rodam como o chamador (invoker).
-- - A RLS em `page_views` já restringe SELECT a admins via is_admin().
-- - Resultado: admin recebe dados, anon/visitante recebe 0 linhas.
--   Nenhum vazamento, sem precisar checar permissão dentro da função.
-- ═══════════════════════════════════════════════════════════════

-- ─────────── 1. Visão geral ───────────
-- Retorna uma única linha com contadores gerais e do período.
-- p_days: tamanho do período em dias (default 30).
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
    period_start AS (SELECT now() - (p_days || ' days')::interval AS ts),
    today_start  AS (SELECT date_trunc('day', now()) AS ts)
  SELECT
    (SELECT count(*) FROM page_views)::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views)::bigint,
    (SELECT count(*) FROM page_views WHERE created_at >= (SELECT ts FROM period_start))::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views WHERE created_at >= (SELECT ts FROM period_start))::bigint,
    (SELECT count(*) FROM page_views WHERE created_at >= (SELECT ts FROM today_start))::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views WHERE created_at >= (SELECT ts FROM today_start))::bigint;
$$;

-- ─────────── 2. Top páginas ───────────
-- Ranking das rotas mais visitadas no período.
-- p_limit: quantidade máxima de linhas retornadas.
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
  SELECT
    path,
    count(*)::bigint                    AS views,
    count(DISTINCT session_id)::bigint  AS unique_visitors
  FROM page_views
  WHERE created_at >= now() - (p_days || ' days')::interval
  GROUP BY path
  ORDER BY views DESC
  LIMIT p_limit;
$$;

-- ─────────── 3. Top referrers ───────────
-- De onde as pessoas vêm (Google, LinkedIn, WhatsApp, etc).
-- Ignora referrers nulos ou vazios (tráfego direto).
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
  SELECT
    referrer,
    count(*)::bigint AS views
  FROM page_views
  WHERE created_at >= now() - (p_days || ' days')::interval
    AND referrer IS NOT NULL
    AND referrer <> ''
  GROUP BY referrer
  ORDER BY views DESC
  LIMIT p_limit;
$$;

-- ─────────── 4. Views por dia ───────────
-- Série temporal para o gráfico. Um row por dia do período.
-- Dias sem views aparecem com zero (generate_series + LEFT JOIN).
CREATE OR REPLACE FUNCTION public.analytics_daily_views(p_days int DEFAULT 30)
RETURNS TABLE (
  day             date,
  views           bigint,
  unique_visitors bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH days AS (
    SELECT generate_series(
      date_trunc('day', now()) - ((p_days - 1) || ' days')::interval,
      date_trunc('day', now()),
      '1 day'::interval
    )::date AS day
  )
  SELECT
    d.day,
    COALESCE(count(pv.id), 0)::bigint                 AS views,
    COALESCE(count(DISTINCT pv.session_id), 0)::bigint AS unique_visitors
  FROM days d
  LEFT JOIN page_views pv
    ON date_trunc('day', pv.created_at)::date = d.day
  GROUP BY d.day
  ORDER BY d.day;
$$;

-- ─────────── 5. Split por dispositivo ───────────
-- Distribuição entre mobile / tablet / desktop.
CREATE OR REPLACE FUNCTION public.analytics_device_split(p_days int DEFAULT 30)
RETURNS TABLE (
  device text,
  views  bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(device, 'unknown') AS device,
    count(*)::bigint            AS views
  FROM page_views
  WHERE created_at >= now() - (p_days || ' days')::interval
  GROUP BY device
  ORDER BY views DESC;
$$;