/**
 * AdminHeader — Barra superior do painel administrativo.
 *
 * Conteúdo:
 * - Botão hamburguer (só mobile) que abre o drawer da sidebar.
 * - Contexto da rota atual em formato de breadcrumb monoespaçado
 *   ("Painel / Projetos"). Substitui o antigo bloco com escudo e
 *   status "Sessão Autenticada", que duplicava informação.
 * - `AdminUserMenu` à direita (avatar, nome, dropdown).
 *
 * Comportamento:
 * - `sticky top-0 z-30` — fica fixo no topo da área de conteúdo.
 * - Fundo quase opaco com blur discreto para o conteúdo passar por baixo.
 */
import { ShieldCheck, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import AdminUserMenu from "./AdminUserMenu";

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

/** Rótulo da seção correspondente a cada rota do painel. */
const SECTION_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/projetos": "Projetos",
  "/experiencia": "Experiências",
  "/educacao": "Formação",
  "/habilidades": "Habilidades",
  "/links-sociais": "Links sociais",
  "/colaboracoes": "Colaborações",
  "/analytics": "Analytics",
  "/perfil": "Perfil",
};

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const { pathname } = useLocation();
  const section = SECTION_LABELS[pathname] ?? "Painel";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:border-brand/40 hover:text-brand lg:hidden"
        >
          <Menu size={17} />
        </button>

        <div className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
          <ShieldCheck size={13} className="hidden shrink-0 sm:block" />
          <span className="hidden sm:inline">Painel</span>
          <span className="hidden text-[var(--color-border)] sm:inline">/</span>
          <span className="truncate text-[var(--color-foreground)]">
            {section}
          </span>
        </div>
      </div>

      <AdminUserMenu />
    </header>
  );
}
