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
import {
  ArrowUpRight,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
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
        aria-label="Menu da conta"
        className={`group flex items-center gap-2 rounded-md border py-1 pl-1 pr-2 transition-colors focus-visible:outline-none ${
          isOpen
            ? "border-brand/40 bg-white/[0.03]"
            : "border-[var(--color-border)] bg-transparent hover:border-brand/35 hover:bg-white/[0.02]"
        }`}
      >
        {/* Avatar */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand/20 bg-brand/10 text-[10px] font-semibold text-brand">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials || <UserIcon size={13} />
          )}
        </span>

        {/* Nome */}
        <span className="hidden max-w-[140px] truncate text-[13px] text-[var(--color-foreground)] sm:block">
          {name}
        </span>

        <ChevronDown
          size={13}
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
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 origin-top-right overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/50"
          >
            {/* Identidade */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-3.5 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand/20 bg-brand/10 text-[11px] font-semibold text-brand">
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

              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)]/80">
                  Sessão ativa
                </p>
                <p className="mt-1 truncate text-[13px] font-medium text-[var(--color-foreground)]">
                  {name}
                </p>
                <p
                  className="truncate font-mono text-[10px] text-[var(--color-muted)]"
                  title={email}
                >
                  {email}
                </p>
              </div>
            </div>

            {/* Itens */}
            <div className="p-1.5">
              <Link
                to="/perfil"
                role="menuitem"
                onClick={closeMenu}
                className="group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-[var(--color-foreground)] outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand/40"
              >
                <UserIcon
                  size={14}
                  className="shrink-0 text-[var(--color-muted)]"
                />
                <span className="flex-1">Perfil</span>
                <ArrowUpRight
                  size={12}
                  className="shrink-0 text-[var(--color-muted)] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </div>

            <div className="border-t border-[var(--color-border)] p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-red-400 outline-none transition-colors hover:bg-red-500/10 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-red-500/40"
              >
                <LogOut size={14} className="shrink-0" />
                <span className="flex-1 text-left">Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
