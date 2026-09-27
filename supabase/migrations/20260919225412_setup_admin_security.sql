-- 1. Tabela de administradores
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Função de segurança para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- 3. Políticas de escrita/edição para projetos restritas a administradores
CREATE POLICY "Permitir inserção de projetos para admins"
ON public.projects FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Permitir atualização de projetos para admins"
ON public.projects FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Permitir exclusão de projetos para admins"
ON public.projects FOR DELETE
USING (public.is_admin());