-- 1. Tabela de Links Sociais
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,        -- 'github', 'linkedin', 'twitter', 'mailto', etc.
  url TEXT NOT NULL,
  label TEXT,                    -- rótulo opcional exibido (ex: "GitHub")
  published BOOLEAN DEFAULT true,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- 3. Política de leitura pública
CREATE POLICY "Permitir leitura pública de links sociais publicados"
ON public.social_links FOR SELECT
USING (published = true);

-- 4. Políticas de escrita para administradores
CREATE POLICY "Permitir inserção de links sociais para admins"
ON public.social_links FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de links sociais para admins"
ON public.social_links FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Permitir exclusão de links sociais para admins"
ON public.social_links FOR DELETE
USING (public.is_admin());