-- ═══════════════════════════════════════════════════════════════
-- Bloco 1 — Retenção automática de page_views
--
-- Objetivo: não acumular dados indefinidamente. Views com mais de
-- 180 dias são removidas diariamente às 03:00 pelo pg_cron.
--
-- Requer a extensão pg_cron habilitada no projeto. Se não estiver
-- (plano gratuito em alguns casos), o Dashboard do Supabase permite
-- habilitá-la em Database → Extensions. Alternativa: agendar via
-- Edge Function (fora do escopo desta migration).
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Função de cleanup.
-- SECURITY DEFINER porque precisa rodar como owner para deletar
-- em qualquer linha, independente da RLS do chamador (o cron roda
-- num contexto sem auth.uid()).
CREATE OR REPLACE FUNCTION public.cleanup_old_page_views(
  retention_days int DEFAULT 180
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.page_views
  WHERE created_at < now() - (retention_days || ' days')::interval;
END;
$$;

-- Apenas o serviço interno deve chamar essa função. Visitantes e
-- admins não precisam do EXECUTE.
REVOKE EXECUTE ON FUNCTION public.cleanup_old_page_views(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_page_views(int) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_page_views(int) FROM authenticated;

-- Agenda a execução diária às 03:00 (fuso do servidor).
-- Se já existir, remove antes para evitar duplicata.
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-page-views');
EXCEPTION WHEN OTHERS THEN
  -- job ainda não existia; nada a fazer
END $$;

SELECT cron.schedule(
  'cleanup-page-views',
  '0 3 * * *',
  $$SELECT public.cleanup_old_page_views(180);$$
);

-- ═══════════════════════════════════════════════════════════════
-- Bloco 2 — Comparação com o período anterior
--
-- Compara a janela atual (últimos p_days) com a janela anterior
-- (p_days antes dela). Permite calcular delta percentual.
--
-- Ex: p_days = 30
--   current  → últimos 30 dias
--   previous → 30-60 dias atrás
-- ═══════════════════════════════════════════════════════════════

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
  WITH windows AS (
    SELECT
      now() - (p_days || ' days')::interval                     AS current_start,
      now() - (p_days * 2 || ' days')::interval                 AS previous_start
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