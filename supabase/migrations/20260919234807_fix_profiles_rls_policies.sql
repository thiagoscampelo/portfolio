-- 1. Garante que RLS está ativo na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Permissão de leitura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Permitir leitura pública do perfil'
  ) THEN
    CREATE POLICY "Permitir leitura pública do perfil"
    ON public.profiles
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- 3. Permissão de inserção para administradores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Permitir inserção de perfil para admins'
  ) THEN
    CREATE POLICY "Permitir inserção de perfil para admins"
    ON public.profiles
    FOR INSERT
    WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 4. Permissão de atualização para administradores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Permitir atualização de perfil para admins'
  ) THEN
    CREATE POLICY "Permitir atualização de perfil para admins"
    ON public.profiles
    FOR UPDATE
    USING (public.is_admin());
  END IF;
END $$;