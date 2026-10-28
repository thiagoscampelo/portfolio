/**
 * AdminApp — Rotas do painel administrativo.
 *
 * Estrutura:
 * - `/login` fica **fora** do `AdminGuard` (não faz sentido exigir
 *   autenticação pra chegar na tela de login).
 * - Todas as outras rotas passam pelo `AdminGuard` → `<AdminLayout />`.
 * - O `<NotFound />` fica **fora** do layout por opção de design — o
 *   404 não precisa de sidebar, e o chunk do `PublicLayout` não precisa
 *   ser carregado no contexto admin.
 *
 * Autenticação:
 * - `AdminGuard` verifica sessão Supabase + RPC `is_admin()`.
 * - Quem não tem sessão ou não está em `admin_users` é redirecionado
 *   pra `/login`.
 *
 * Lazy loading:
 * - Todas as páginas são lazy para code-split. Cada aba do admin vira
 *   um chunk separado.
 * - `ScrollToTop` reseta o scroll ao trocar de rota.
 */
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminGuard from "../components/auth/AdminGuard";
import AdminLayout from "../layouts/AdminLayout";
import ScrollToTop from "../components/layout/ScrollToTop";
import AppLoading from "../components/layout/AppLoading";
import ErrorBoundary from "../components/layout/ErrorBoundary";

const Login = lazy(() => import("../pages/Admin/Login/Login"));
const AdminDashboard = lazy(
  () => import("../pages/Admin/Dashboard/AdminDashboard"),
);
const AdminProjects = lazy(
  () => import("../pages/Admin/Projects/AdminProjects"),
);
const AdminExperiences = lazy(
  () => import("../pages/Admin/Experiences/AdminExperiences"),
);
const AdminSkills = lazy(() => import("../pages/Admin/Skills/AdminSkills"));
const AdminProfile = lazy(() => import("../pages/Admin/Profile/AdminProfile"));
const AdminEducation = lazy(
  () => import("../pages/Admin/Education/AdminEducation"),
);
const AdminSocialLinks = lazy(
  () => import("../pages/Admin/SocialLinks/AdminSocialLinks"),
);
const AdminCollaborations = lazy(
  () => import("../pages/Admin/Collaborations/AdminCollaborations"),
);
const AdminAnalytics = lazy(
  () => import("../pages/Admin/Analytics/AdminAnalytics"),
);
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

export default function AdminApp() {
  return (
    <div className="admin-theme min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <ScrollToTop />
      <Suspense fallback={<AppLoading />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ErrorBoundary variant="admin">
                <AdminGuard />
              </ErrorBoundary>
            }
          >
            <Route element={<AdminLayout />}>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/projetos" element={<AdminProjects />} />
              <Route path="/experiencia" element={<AdminExperiences />} />
              <Route path="/habilidades" element={<AdminSkills />} />
              <Route path="/perfil" element={<AdminProfile />} />
              <Route path="/educacao" element={<AdminEducation />} />
              <Route path="/links-sociais" element={<AdminSocialLinks />} />
              <Route path="/colaboracoes" element={<AdminCollaborations />} />
              <Route path="/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <ErrorBoundary variant="admin">
                <NotFound />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}
