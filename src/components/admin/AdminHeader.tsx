/**
 * AdminHeader — Barra superior do painel administrativo.
 *
 * Conteúdo:
 * - Botão hamburguer (só mobile) que abre o drawer da sidebar.
 * - Bloco de contexto: ícone de escudo + "Painel de Controle" + status
 *   "Sessão Autenticada" com dot verde pulsante.
 * - `AdminUserMenu` à direita (avatar, nome, dropdown).
 *
 * Comportamento:
 * - `sticky top-0 z-30` — fica fixo no topo da área de conteúdo.
 * - Backdrop blur para que o conteúdo role por baixo com transparência.
 *
 * Responsividade:
 * - `h-16` em mobile, `h-20` em tablet+.
 * - O bloco do escudo (`ShieldCheck`) esconde em telas muito pequenas
 *   para não competir com o hamburguer e o user menu.
 */
import { ShieldCheck, Menu } from "lucide-react";
import AdminUserMenu from "./AdminUserMenu";

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 w-full shrink-0 border-b border-[var(--color-border)]/50 bg-[var(--color-background)]/60 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all gap-4">
      {/* Left: hamburguer + status */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburguer (só mobile) */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
          className="lg:hidden flex items-center justify-center h-9 w-9 shrink-0 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-card)] transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] block truncate">
              Painel de Controle
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sessão Autenticada
            </span>
          </div>
        </div>
      </div>

      {/* User menu */}
      <AdminUserMenu />
    </header>
  );
}
