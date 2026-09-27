/**
 * AdminUserMenu — Dropdown de usuário no canto superior direito.
 *
 * Conteúdo do dropdown:
 * - Cabeçalho com nome + email.
 * - Link para `/perfil`.
 * - Botão "Sair" (faz `supabase.auth.signOut()` e redireciona pra `/login`).
 *
 * Avatar com fallback:
 * 1. `profile.avatarUrl` (se existir no Supabase Storage).
 * 2. Iniciais do nome (ex: "Thiago Campelo" → "TC").
 * 3. Ícone genérico de usuário (`<UserIcon />`).
 *
 * Acessibilidade:
 * - `aria-haspopup="menu"` + `aria-expanded` no botão.
 * - `role="menu"` + `role="menuitem"` nos itens.
 * - **Esc fecha** e devolve o foco ao botão.
 * - **Clique fora fecha** via listener no `document`.
 * - **Foco automático** vai pro primeiro item ao abrir (60ms de delay
 *   pra aguardar a animação de entrada do Framer Motion).
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

export default function AdminUserMenu() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { profile } = useProfile();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = profile?.name || "Administrador";
  const email = session?.user?.email || "—";
  const avatarUrl = profile?.avatarUrl;

  // Iniciais como fallback do avatar (ex: "Thiago Campelo" → "TC")
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  function closeMenu() {
    setIsOpen(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Esc fecha e devolve foco pro botão
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Foco vai pro primeiro item ao abrir.
  // Delay de 60ms para aguardar a animação de entrada do dropdown —
  // focar um elemento que ainda está animando causa comportamento
  // errático no browser.
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      menuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Botão */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/40 hover:bg-[var(--color-card)]/70 px-2 py-1.5 pr-3 transition-colors"
      >
        {/* Avatar */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-400">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials || <UserIcon size={14} />
          )}
        </span>

        {/* Nome */}
        <span className="hidden sm:flex flex-col items-start leading-tight max-w-[160px]">
          <span className="text-xs font-medium text-[var(--color-foreground)] truncate w-full text-left">
            {name}
          </span>
          <span className="text-[10px] text-[var(--color-muted)] truncate w-full text-left">
            {email}
          </span>
        </span>

        <ChevronDown
          size={14}
          className={`shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            {/* Cabeçalho do dropdown */}
            <div className="px-4 py-3 border-b border-[var(--color-border)]/60">
              <p className="text-xs font-semibold text-[var(--color-foreground)] truncate">
                {name}
              </p>
              <p
                className="text-[11px] text-[var(--color-muted)] truncate mt-0.5"
                title={email}
              >
                {email}
              </p>
            </div>

            {/* Itens */}
            <div className="p-1.5">
              <Link
                to="/perfil"
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)]/60 transition-colors"
              >
                <UserIcon size={15} className="text-[var(--color-muted)]" />
                <span>Perfil</span>
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                <span>Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
