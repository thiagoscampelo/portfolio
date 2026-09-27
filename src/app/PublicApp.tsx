/**
 * PublicApp — Rotas do site público.
 *
 * Estrutura:
 * - `ScrollToTop` — reseta o scroll ao trocar de rota.
 * - `<PublicLayout>` — envolve todas as páginas com Header + Footer.
 * - Todas as páginas são lazy-loaded para code-split por rota.
 * - A rota `*` (fora do layout) mostra o 404 público.
 *
 * Tracking:
 * - `usePageTracking()` é chamado aqui — registra uma page view no Supabase
 *   a cada mudança de rota (só em produção). Fica em `PublicApp` (não em
 *   `PublicLayout`) para não ser executado nas rotas do admin.
 *
 * Suspense:
 * - O `<Suspense>` externo cobre o `<NotFound />` (que fica fora do layout).
 * - As páginas **dentro** do `PublicLayout` são pegas pelo Suspense interno
 *   do layout — assim Header e Footer não desmontam ao trocar de rota.
 */
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ScrollToTop from "../components/layout/ScrollToTop";
import AppLoading from "../components/layout/AppLoading";
import { usePageTracking } from "../hooks/usePageTracking";

const Home = lazy(() => import("../pages/Home/Home"));
const Projects = lazy(() => import("../pages/Projects/Projects"));
const ProjectDetails = lazy(
  () => import("../pages/ProjectDetails/ProjectDetails"),
);
const Experiences = lazy(() => import("../pages/Experiences/Experiences"));
const About = lazy(() => import("../pages/About/About"));
const Contact = lazy(() => import("../pages/Contact/Contact"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

export default function PublicApp() {
  usePageTracking();

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<AppLoading />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projetos" element={<Projects />} />
            <Route path="/projetos/:slug" element={<ProjectDetails />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/experiencia" element={<Experiences />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
