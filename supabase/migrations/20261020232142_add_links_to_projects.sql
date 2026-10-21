-- ═══════════════════════════════════════════════════════════════
-- Adiciona coluna `links` (array JSON) à tabela de projetos.
--
-- Motivação:
-- Um projeto pode ter múltiplos repositórios (frontend + backend)
-- e alguns podem ser privados (sem URL pública). Em vez de N colunas
-- booleanas por tipo de link, usamos um array JSON que se adapta.
--
-- Formato esperado:
--   [
--     { "type": "frontend", "url": "https://github.com/..." },
--     { "type": "backend",  "url": "https://github.com/..." },
--     { "type": "docs",     "url": null }   ← link indisponível
--   ]
--
-- Compatibilidade:
-- Os campos github_url e demo_url continuam na tabela por segurança,
-- mas param de ser usados após a migração. O UPDATE abaixo popula
-- `links` a partir deles para não perder dados existentes.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS links JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Migra os dados legados para o novo formato, apenas em projetos que
-- ainda têm `links` vazio e pelo menos um dos campos antigos preenchido.
UPDATE public.projects
SET links = sub.new_links
FROM (
  SELECT
    id,
    jsonb_agg(item)
      FILTER (WHERE item IS NOT NULL)
      AS new_links
  FROM (
    SELECT
      id,
      CASE WHEN github_url IS NOT NULL
        THEN jsonb_build_object('type', 'frontend', 'url', github_url)
        ELSE NULL
      END AS item
    FROM public.projects
    UNION ALL
    SELECT
      id,
      CASE WHEN demo_url IS NOT NULL
        THEN jsonb_build_object('type', 'demo', 'url', demo_url)
        ELSE NULL
      END AS item
    FROM public.projects
  ) expanded
  GROUP BY id
) sub
WHERE projects.id = sub.id
  AND projects.links = '[]'::jsonb
  AND sub.new_links IS NOT NULL;