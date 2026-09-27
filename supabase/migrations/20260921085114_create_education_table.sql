-- 1. Tabela de Formação Acadêmica
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  course TEXT NOT NULL,
  description TEXT,
  period TEXT NOT NULL,
  published BOOLEAN DEFAULT true,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- 3. Leitura pública
CREATE POLICY "Permitir leitura pública de formação publicada"
ON public.education FOR SELECT
USING (published = true);

-- 4. Escrita para admins
CREATE POLICY "Permitir inserção de formação para admins"
ON public.education FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de formação para admins"
ON public.education FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Permitir exclusão de formação para admins"
ON public.education FOR DELETE
USING (public.is_admin());