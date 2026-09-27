-- 1. Tabela de tipos de colaboração
CREATE TABLE IF NOT EXISTS public.collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  published BOOLEAN DEFAULT true,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- 3. Leitura pública
CREATE POLICY "Permitir leitura pública de colaborações publicadas"
ON public.collaborations FOR SELECT
USING (published = true);

-- 4. Escrita para admins
CREATE POLICY "Permitir inserção de colaborações para admins"
ON public.collaborations FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de colaborações para admins"
ON public.collaborations FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Permitir exclusão de colaborações para admins"
ON public.collaborations FOR DELETE
USING (public.is_admin());