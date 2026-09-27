-- Projetos: admins veem tudo, público vê só publicados
CREATE POLICY "Permitir leitura total de projetos para admins"
ON public.projects FOR SELECT
USING (public.is_admin());

-- Experiências
CREATE POLICY "Permitir leitura total de experiências para admins"
ON public.experiences FOR SELECT
USING (public.is_admin());

-- Habilidades
CREATE POLICY "Permitir leitura total de habilidades para admins"
ON public.skills FOR SELECT
USING (public.is_admin());

-- Formação
CREATE POLICY "Permitir leitura total de formação para admins"
ON public.education FOR SELECT
USING (public.is_admin());

-- Links sociais
CREATE POLICY "Permitir leitura total de links sociais para admins"
ON public.social_links FOR SELECT
USING (public.is_admin());

-- Colaborações
CREATE POLICY "Permitir leitura total de colaborações para admins"
ON public.collaborations FOR SELECT
USING (public.is_admin());