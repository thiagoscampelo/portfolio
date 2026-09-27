-- 1. Tabela de page views
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  device TEXT,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices para agregações
CREATE INDEX IF NOT EXISTS idx_page_views_created_at
  ON public.page_views (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_path
  ON public.page_views (path);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id
  ON public.page_views (session_id);

-- 3. RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- INSERT público (visitantes anônimos precisam registrar views)
CREATE POLICY "Permitir inserção pública de page_views"
ON public.page_views FOR INSERT
WITH CHECK (true);

-- SELECT apenas admins
CREATE POLICY "Permitir leitura de page_views para admins"
ON public.page_views FOR SELECT
USING (public.is_admin());

-- DELETE apenas admins (para cleanup manual)
CREATE POLICY "Permitir exclusão de page_views para admins"
ON public.page_views FOR DELETE
USING (public.is_admin());