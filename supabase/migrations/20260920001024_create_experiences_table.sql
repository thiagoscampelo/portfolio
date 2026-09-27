-- 1. Tabela de Experiências Profissionais
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,           -- ex: "01", "02"
  period TEXT NOT NULL,           -- ex: "2024 — Presente"
  role TEXT NOT NULL,             -- ex: "Software Engineer"
  company TEXT NOT NULL,          -- ex: "Tech Company"
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Politica de leitura pública
CREATE POLICY "Permitir leitura pública de experiências publicadas"
ON public.experiences FOR SELECT
USING (published = true);

-- Politicas de escrita para administradores
CREATE POLICY "Permitir inserção de experiências para admins"
ON public.experiences FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de experiências para admins"
ON public.experiences FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Permitir exclusão de experiências para admins"
ON public.experiences FOR DELETE
USING (public.is_admin());