/**
 * AdminSidebar — Navegação lateral do painel administrativo.
 *
 * Comportamento responsivo:
 * - **Desktop (lg+)**: sidebar fixa de 240px, sempre visível.
 * - **Mobile/tablet**: drawer lateral que desliza da esquerda, com
 *   backdrop escuro. Controlado por `isOpen`/`onClose` (props).
 *
 * Estado ativo:
 * - Item atual com fundo verde translúcido, texto verde e uma barra
 *   vertical de 2px na borda esquerda. Sem pill animado — a navegação
 *   é estática e discreta, coerente com o restante do painel.
 *
 * Navegação:
 * - Cada `NavLink` chama `onClose()` ao clicar. Isso garante que o drawer
 *   feche em mobile quando o usuário seleciona uma opção.
 * - `end` no item `/` (Dashboard) evita que ele fique ativo em todas as
 *   rotas que começam com `/`.
 * - Os itens são agrupados por área (conteúdo, presença, métricas) com
 *   rótulos monoespaçados.
 *
 * Itens com `disabled: true`:
 * - Renderizam como `<div>` inerte, com badge "breve" e cursor
 *   `not-allowed`. Usado para opções ainda não implementadas.
 */
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Code2,
  GraduationCap,
  Share2,
  Handshake,
  X,
  BarChart3,
} from "lucide-react";
import BrandMark from "../Brandmark";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Conteúdo",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "Projetos", path: "/projetos", icon: FolderKanban },
      { label: "Experiências", path: "/experiencia", icon: Briefcase },
      { label: "Formação", path: "/educacao", icon: GraduationCap },
      { label: "Habilidades", path: "/habilidades", icon: Code2 },
    ],
  },
  {
    label: "Presença",
    items: [
      { label: "Links sociais", path: "/links-sociais", icon: Share2 },
      { label: "Colaborações", path: "/colaboracoes", icon: Handshake },
    ],
  },
  {
    label: "Métricas",
    items: [{ label: "Analytics", path: "/analytics", icon: BarChart3 }],
  },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const currentYear = new Date().getFullYear();

  const content = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Marca — mesmo lockup da tela de login */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark className="h-9 w-9 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]">
                TSCAMPELO
              </p>
              <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Software Development
              </p>
            </div>
          </div>

          {/* Botão fechar (só mobile) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-foreground)] lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-6 px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--color-muted)]/70">
                {group.label}
              </p>

              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.path}
                        aria-disabled="true"
                        title="Em breve"
                        className="flex cursor-not-allowed items-center justify-between gap-3 rounded-md px-2.5 py-2 text-[13px] text-[var(--color-muted)]/40"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={15} />
                          <span>{item.label}</span>
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em]">
                          breve
                        </span>
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                          isActive
                            ? "bg-brand/[0.08] text-brand"
                            : "text-[var(--color-muted)] hover:bg-white/[0.03] hover:text-[var(--color-foreground)]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full transition-opacity ${
                              isActive ? "bg-brand opacity-100" : "opacity-0"
                            }`}
                            aria-hidden="true"
                          />
                          <Icon size={15} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)]/70">
        <span>© {currentYear} TSCAMPELO</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-brand" aria-hidden="true" />
          Painel
        </span>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: sidebar fixa */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-background)] lg:flex">
        {content}
      </aside>

      {/* Mobile: drawer animado */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col justify-between overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-background)] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
