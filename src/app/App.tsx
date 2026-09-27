/**
 * App — Ponto de entrada da aplicação.
 *
 * Responsabilidade única: decidir entre `PublicApp` e `AdminApp` com base
 * no hostname. Não contém lógica de negócio nem rotas.
 *
 * Regra de decisão:
 * - `admin.*` → renderiza `<AdminApp />` (painel administrativo)
 * - qualquer outro hostname → renderiza `<PublicApp />` (site público)
 *
 * Ambos os apps são lazy-loaded (code-split) para que o bundle do admin
 * não seja baixado por visitantes do site público — e vice-versa.
 *
 * Providers globais:
 * - `MotionConfig reducedMotion="user"` — respeita `prefers-reduced-motion`
 *   do SO. Desliga translações em todas as animações do Framer Motion.
 * - `ToastProvider` + `ConfirmProvider` — disponíveis em toda a árvore
 *   (usados só no admin, mas custo zero quando ninguém chama).
 * - `BrowserRouter` — roteamento SPA.
 *
 * SEO:
 * - Injeta `<meta name="robots" content="noindex,nofollow">` **apenas**
 *   quando o hostname começa com `admin.`. Feito em runtime (não no
 *   index.html) porque uma tag estática bloquearia a indexação do
 *   site público também.
 */
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ToastProvider } from "../components/admin/Toast";
import { ConfirmProvider } from "../components/admin/ConfirmDialog";
import AppLoading from "../components/layout/AppLoading";

const AdminApp = lazy(() => import("./AdminApp"));
const PublicApp = lazy(() => import("./PublicApp"));

export default function App() {
  const hostname = window.location.hostname;
  const isAdminSubdomain = hostname.startsWith("admin.");

  // Bloqueia indexação apenas no admin.
  // Injetado em runtime porque a tag precisa ser condicional — o público
  // deve ser indexado, o admin não.
  useEffect(() => {
    if (!isAdminSubdomain) return;

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, [isAdminSubdomain]);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Suspense fallback={<AppLoading />}>
              {isAdminSubdomain ? <AdminApp /> : <PublicApp />}
            </Suspense>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
