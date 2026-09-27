-- 1. Tabela key/value
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 3. Leitura pública
CREATE POLICY "Leitura pública de site_content"
ON public.site_content FOR SELECT
USING (true);

-- 4. Escrita para admins
CREATE POLICY "Inserção de site_content para admins"
ON public.site_content FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Atualização de site_content para admins"
ON public.site_content FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Exclusão de site_content para admins"
ON public.site_content FOR DELETE
USING (public.is_admin());

-- 5. Seed com os valores atuais hardcoded
INSERT INTO public.site_content (key, value) VALUES
  ('home_projects_title', 'Projetos selecionados.'),
  ('home_experience_title', 'Minha trajetória.'),
  ('home_experience_description', 'Um resumo do meu percurso profissional e das principais tecnologias com que tenho trabalhado.'),

  ('projects_hero_eyebrow', 'Portfólio'),
  ('projects_hero_title', 'Projetos selecionados.'),
  ('projects_hero_subtitle', 'Uma coleção de aplicações e soluções em que trabalhei.'),

  ('contact_hero_eyebrow', 'Contato'),
  ('contact_hero_title', 'Vamos conversar?'),
  ('contact_hero_subtitle', 'Estou disponível para novas oportunidades, projetos de desenvolvimento, consultorias ou simplesmente para trocar ideias sobre tecnologia.'),
  ('contact_collab_description', 'Formatos de colaboração que costumo aceitar. Se o seu caso não estiver aqui, ainda vale conversar.'),

  ('about_cta_title', 'Quer conhecer meu trabalho de perto?'),

  ('footer_tagline', 'focado na construção de aplicações web modernas, elegantes e de alta performance.')
ON CONFLICT (key) DO NOTHING;