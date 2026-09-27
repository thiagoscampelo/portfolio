-- ═══════════════════════════════════════════════════════════════
-- S3 — Hardening do bucket portfolio-assets.
--
-- Três problemas:
--   1. A policy "Acesso público aos ficheiros" habilitava .list() para
--      anon — qualquer portador da chave pública enumerava tudo,
--      incluindo currículos antigos com dados pessoais.
--      IMPORTANTE: a URL pública de um arquivo NÃO passa pela policy
--      de SELECT. Buckets marcados como `public = true` são servidos
--      pelo CDN sem consultar RLS. Remover a policy não quebra o
--      acesso direto às imagens já em uso.
--   2. Sem file_size_limit nem allowed_mime_types, um upload podia
--      mandar 500 MB ou um .exe renomeado.
--   3. O bucket nasceu sem essas validações porque a migration
--      original só se importava com policies.
--
-- O que fica de fora (patch frontend na sequência):
--   - upsert: true em upload.ts (inútil com nome aleatório).
--   - Limpeza de arquivos órfãos ao substituir.
-- ═══════════════════════════════════════════════════════════════


-- ─────────── 1. Remover a policy de listagem pública ───────────
DROP POLICY IF EXISTS "Acesso público aos ficheiros" ON storage.objects;


-- ─────────── 2. SELECT apenas para admins ───────────
-- Permite que o admin (futuramente) liste arquivos para limpeza.
-- Visitantes não conseguem mais enumerar.
CREATE POLICY "Admins podem listar objetos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'portfolio-assets'
  AND public.is_admin()
);


-- ─────────── 3. Limites do bucket ───────────
-- 10 MiB: folga confortável para capas de projeto (normalmente <2 MB)
-- e PDFs de currículo.
--
-- allowed_mime_types: união dos tipos usados pelos três subdiretórios
-- (avatars/, resumes/, projects/). Como a restrição é por bucket (não
-- por prefixo), a lista precisa cobrir todos os casos.
UPDATE storage.buckets
SET
  file_size_limit = 10485760, -- 10 MiB
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf'
  ]
WHERE id = 'portfolio-assets';