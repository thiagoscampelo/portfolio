/**
 * Header — Navegação principal do site público.
 *
 * Comportamento:
 * - **Sticky** no topo com backdrop blur — fica visível durante o scroll.
 * - **Desktop (md+)**: nav horizontal + status "Disponível para projetos"
 *   (só em lg+).
 * - **Mobile (< md)**: botão hamburguer que abre um menu colapsável
 *   animado com Framer Motion.
 *
 * Acessibilidade:
 * - **Skip link** integrado ao `PublicLayout` aponta para `#main-content`.
 * - **aria-current="page"** no link ativo.
 * - **aria-expanded** + **aria-controls** no botão hamburguer.
 * - **Esc fecha** o menu mobile e devolve o foco ao botão.
 * - **Scroll lock** do body enquanto o menu mobile está aberto.
 * - **Foco vai pro primeiro link** ao abrir (60ms de delay pra aguardar
 *   a animação).
 * - **Fecha o menu** automaticamente ao trocar de rota.
 *
 * Fontes de dados:
 * - Nome (`profile.name`) e status (`profile.available`) vêm do banco.
 *   Fallback hardcoded quando `profile` ainda está carregando.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Container from "./Container";
import LogoHorizontal from "../LogoHorizontal";
import { useProfile } from "../../hooks/useProfile";

export default function Header() {
  const location = useLocation();
  const { profile } = useProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Início", path: "/" },
    { label: "Projetos", path: "/projetos" },
    { label: "Sobre", path: "/sobre" },
    { label: "Contato", path: "/contato" },
  ];

  const isAvailable = profile?.available ?? true;

  function isRouteActive(path: string) {
    return path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);
  }

  function closeMenu() {
    setIsMenuOpen(false);
    toggleRef.current?.focus();
  }

  // Bloqueia scroll do body enquanto menu está aberto
  useEffect(() => {
    if (!isMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  // Esc fecha o menu
  useEffect(() => {
    if (!isMenuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMenuOpen]);

  // Foco vai pro primeiro link ao abrir
  useEffect(() => {
    if (!isMenuOpen) return;
    const timer = setTimeout(() => {
      menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [isMenuOpen]);

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/70 backdrop-blur-xl transition-all">
      <Container className="h-20 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center"
          aria-label="TSCAMPELO — página inicial"
        >
          <LogoHorizontal className="h-10 w-auto sm:h-12 transition-opacity group-hover:opacity-80" />
        </Link>

        {/* Nav desktop */}
        <div className="hidden md:flex items-center gap-8">
          {isAvailable && (
            <>
              <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
                <span>Disponível para projetos</span>
              </div>
              <div className="hidden lg:block h-4 w-[1px] bg-[var(--color-border)]" />
            </>
          )}

          <nav className="flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = isRouteActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative py-1 transition-colors ${
                    isActive
                      ? "text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-accent)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Toggle mobile */}
        <button
          ref={toggleRef}
          onClick={() => setIsMenuOpen((v) => !v)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-card)] transition-colors"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-xl"
          >
            <Container className="py-6 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = isRouteActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between py-3 px-3 rounded-lg text-base transition-colors ${
                      isActive
                        ? "text-[var(--color-foreground)] font-medium bg-[var(--color-card)]"
                        : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]/50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </Link>
                );
              })}

              {isAvailable && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                  </span>
                  <span>Disponível para projetos</span>
                </div>
              )}
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
