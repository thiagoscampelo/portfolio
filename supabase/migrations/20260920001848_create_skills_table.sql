-- 1. Tabela de Habilidades / Competências
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Frontend', -- Ex: Frontend, Backend, Database, DevOps, Ferramentas
  published BOOLEAN DEFAULT true,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Permitir leitura pública de habilidades publicadas"
ON public.skills FOR SELECT
USING (published = true);

-- Políticas de escrita para administradores
CREATE POLICY "Permitir inserção de habilidades para admins"
ON public.skills FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de habilidades para admins"
ON public.skills FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Permitir exclusão de habilidades para admins"
ON public.skills FOR DELETE
USING (public.is_admin());