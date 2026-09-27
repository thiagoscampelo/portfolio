-- Adiciona campo `type` à tabela education.
-- Default 'degree' para que registros existentes (faculdades)
-- continuem categorizados corretamente após a migration.
ALTER TABLE public.education
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'degree';

-- Constraint garante que só valores conhecidos entram.
-- Se um dia precisar de mais categorias, cria nova migration alterando
-- essa constraint — nunca edita a existente.
ALTER TABLE public.education
DROP CONSTRAINT IF EXISTS education_type_check;

ALTER TABLE public.education
ADD CONSTRAINT education_type_check
CHECK (type IN ('degree', 'technical', 'certification', 'course'));