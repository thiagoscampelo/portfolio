/**
 * AdminSidebar — Navegação lateral do painel administrativo.
 *
 * Comportamento responsivo:
 * - **Desktop (lg+)**: sidebar fixa de 256px, sempre visível.
 * - **Mobile/tablet**: drawer lateral que desliza da esquerda, com
 *   backdrop escuro. Controlado por `isOpen`/`onClose` (props).
 *
 * Estado ativo:
 * - O item atual usa um pill indigo animado. O `layoutId` compartilhado
 *   faz o pill "deslizar" entre itens quando o usuário navega — efeito
 *   de continuidade visual em vez de simples troca de cor.
 *
 * Navegação:
 * - Cada `NavLink` chama `onClose()` ao clicar. Isso garante que o drawer
 *   feche em mobile quando o usuário seleciona uma opção.
 * - `end` no item `/` (Dashboard) evita que ele fique ativo em todas as
 *   rotas que começam com `/`.
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
import { useProfile } from "../../hooks/useProfile";
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

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const currentYear = new Date().getFullYear();
  const { profile } = useProfile();

  const primaryItems: NavItem[] = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Projetos", path: "/projetos", icon: FolderKanban },
    { label: "Experiência", path: "/experiencia", icon: Briefcase },
    { label: "Formação", path: "/educacao", icon: GraduationCap },
    { label: "Habilidades", path: "/habilidades", icon: Code2 },
    { label: "Links Sociais", path: "/links-sociais", icon: Share2 },
    { label: "Colaborações", path: "/colaboracoes", icon: Handshake },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
  ];

  const name = profile?.name || "Thiago Campelo";

  const content = (
    <>
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-[var(--color-border)]/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <BrandMark className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold tracking-tight text-[var(--color-foreground)] text-sm truncate">
                Portfolio
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] truncate">
                Admin Console
              </p>
            </div>
          </div>

          {/* Botão fechar (só mobile) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="lg:hidden flex items-center justify-center h-8 w-8 shrink-0 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {primaryItems.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.path}
                  aria-disabled="true"
                  title="Em breve"
                  className="relative flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[var(--color-muted)]/50 cursor-not-allowed"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)]/40">
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
                  `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-background)]/50 hover:text-[var(--color-foreground)]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      size={16}
                      className={`relative z-10 ${isActive ? "text-white" : ""}`}
                    />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border)]/60 text-[10px] text-[var(--color-muted)] text-center font-mono">
        © {currentYear} {name}. Todos os direitos reservados.
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: sidebar fixa */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-[var(--color-border)]/60 bg-[var(--color-card)]/30 backdrop-blur-2xl flex-col justify-between h-screen sticky top-0">
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
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 z-50 h-screen w-72 max-w-[85vw] border-r border-[var(--color-border)]/60 bg-[var(--color-card)] flex flex-col justify-between overflow-hidden"
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
