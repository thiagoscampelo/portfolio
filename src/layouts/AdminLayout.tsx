/**
 * AdminLayout — Estrutura compartilhada do painel administrativo.
 *
 * Responsabilidade:
 * - Sidebar (fixa em desktop, drawer em mobile).
 * - Header (sticky, com user menu).
 * - `<main>` com scroll interno próprio.
 * - Coordena o estado do drawer (aberto/fechado) e seus efeitos colaterais.
 *
 * Responsividade:
 * - **Desktop (lg+)**: sidebar visível à esquerda, sempre.
 * - **Mobile/tablet**: sidebar escondida por padrão. Header tem um botão
 *   hamburguer que abre um drawer lateral com backdrop.
 *
 * Coordenação do drawer:
 * 1. **Fecha ao trocar de rota** — evita sidebar presa aberta quando o
 *    usuário navega pelo próprio menu.
 * 2. **Esc fecha** — devolve o controle ao teclado.
 * 3. **Scroll lock** — `body.overflow: hidden` enquanto aberto, para que
 *    o conteúdo de trás não role junto com o drawer.
 *
 * Estrutura:
 *   <div flex h-screen>
 *     <AdminSidebar /> (fixed lg:sticky, w-64)
 *     <div flex-col flex-1>
 *       <AdminHeader /> (sticky, z-30)
 *       <main> (scroll interno, padding responsivo)
 *     </div>
 *   </div>
 *
 * Nota sobre `h-screen` vs `min-h-screen`:
 * - Usamos `h-screen` para que o `<main>` tenha uma área de scroll própria,
 *   separada do header. `min-h-screen` faria o body inteiro scrollar e o
 *   header sticky perderia o efeito.
 */
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Fecha o drawer ao trocar de rota
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Esc fecha o drawer
  useEffect(() => {
    if (!isSidebarOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsSidebarOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isSidebarOpen]);

  // Bloqueia scroll do body enquanto o drawer está aberto
  useEffect(() => {
    if (!isSidebarOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] selection:bg-brand selection:text-brand-contrast">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto">
        <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
  