-- ═══════════════════════════════════════════════════════════════
-- B4 — Fuso horário nas funções de analytics.
--
-- date_trunc('day', now()) usa o fuso do servidor (UTC na Supabase).
-- No Brasil (UTC-3), "hoje" vira às 21h — o card "Views hoje" fica
-- 3 horas por dia mostrando o dia errado. O gráfico diário agrupa
-- errado pela mesma razão.
--
-- A conversão correta é em duas etapas:
--   1. now() AT TIME ZONE 'America/Sao_Paulo'
--      → timestamp without tz representando o relógio de parede em SP
--   2. date_trunc('day', ...)  → meia-noite em SP como timestamp without tz
--   3. ... AT TIME ZONE 'America/Sao_Paulo'
--      → converte de volta para o instante correto (timestamptz)
--
-- Para o JOIN do gráfico, o mesmo raciocínio se aplica em pv.created_at.
--
-- Fuso fixo no código (não em parâmetro): o admin é uma pessoa só, no
-- Brasil. Se virar multi-fuso, parametrizar.
-- ═══════════════════════════════════════════════════════════════


-- ─────────── analytics_overview ───────────
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
    today_start  AS (
      SELECT (
        date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo')
      ) AT TIME ZONE 'America/Sao_Paulo' AS ts
    )
  SELECT
    (SELECT count(*) FROM page_views)::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views)::bigint,
    (SELECT count(*) FROM page_views WHERE created_at >= (SELECT ts FROM period_start))::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views WHERE created_at >= (SELECT ts FROM period_start))::bigint,
    (SELECT count(*) FROM page_views WHERE created_at >= (SELECT ts FROM today_start))::bigint,
    (SELECT count(DISTINCT session_id) FROM page_views WHERE created_at >= (SELECT ts FROM today_start))::bigint;
$$;


-- ─────────── analytics_daily_views ───────────
-- Aqui a mudança é dupla: a série gerada E o JOIN com page_views
-- precisam usar o mesmo fuso, senão os pontos do gráfico ficam
-- deslocados um dia.
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
        date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo')
          - (((SELECT days FROM p) - 1) || ' days')::interval,
        date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo'),
        '1 day'::interval
      )::date AS day
    )
  SELECT
    d.day,
    COALESCE(count(pv.id), 0)::bigint                  AS views,
    COALESCE(count(DISTINCT pv.session_id), 0)::bigint AS unique_visitors
  FROM days d
  LEFT JOIN page_views pv
    ON (
      date_trunc('day', pv.created_at AT TIME ZONE 'America/Sao_Paulo')
    )::date = d.day
  GROUP BY d.day
  ORDER BY d.day;
$$;


-- ─────────── analytics_compare ───────────
-- Rolling windows (now() - N days). Não usa date_trunc — o fuso não
-- afeta o resultado. Redefinida só para manter o clamp de p_days.
-- (Nenhuma mudança de comportamento.)