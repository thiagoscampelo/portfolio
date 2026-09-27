-- ═══════════════════════════════════════════════════════════════
-- Normaliza referrers para hostname.
--
-- Motivação:
-- A versão anterior agrupava pela URL completa do referrer. Isso
-- fragmentava a origem: duas visitas do Google com queries diferentes
-- geravam duas linhas, cada uma com count 1.
--
-- Nova versão:
-- - Remove protocolo (`https://`) e prefixo `www.`.
-- - Trunca no primeiro `/` (remove path e query string).
-- - Agrupa por hostname normalizado.
--
-- A assinatura da função é idêntica — nenhuma mudança de tipo no client.
-- ═══════════════════════════════════════════════════════════════

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
    lower(
      split_part(
        regexp_replace(referrer, '^https?://(www\.)?', ''),
        '/',
        1
      )
    ) AS referrer,
    count(*)::bigint AS views
  FROM page_views
  WHERE created_at >= now() - (p_days || ' days')::interval
    AND referrer IS NOT NULL
    AND referrer <> ''
  GROUP BY 1
  ORDER BY views DESC
  LIMIT p_limit;
$$;