-- 1. Atualizar a função 'is_admin' com SECURITY DEFINER e search_path explícito
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$;

-- 2. Garantir que o próprio utilizador autenticado consegue consultar a sua linha em admin_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_users' AND policyname = 'Permitir leitura da própria linha em admin_users'
  ) THEN
    CREATE POLICY "Permitir leitura da própria linha em admin_users"
    ON public.admin_users
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;