-- 1. Criar bucket público para uploads do portfólio (avatar e documentos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acesso ao Storage
-- Leitura pública para qualquer pessoa
CREATE POLICY "Acesso público aos ficheiros"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

-- Escrita/Upload restrito a administradores
CREATE POLICY "Permitir upload para admins"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-assets' AND public.is_admin());

-- Eliminação/Atualização restrita a administradores
CREATE POLICY "Permitir eliminação para admins"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-assets' AND public.is_admin());