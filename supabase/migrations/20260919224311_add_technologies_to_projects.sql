-- Adicionar a coluna de tecnologias como array de texto na tabela de projetos
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}';