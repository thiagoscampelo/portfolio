/**
 * Hero — Seção de abertura da Home.
 *
 * Estrutura:
 * - Blobs verdes decorativos (2, estáticos em mobile, animados em desktop
 *   via `motion.div` com `repeat: Infinity`).
 * - Bloco de texto: role/label, título principal, subtítulo, CTAs.
 * - Avatar com animação de flutuação contínua.
 *
 * Fontes de dados (todas com fallback hardcoded):
 * - `profile.role`          → label superior ("Software Developer")
 * - `profile.heroTitle`     → H1
 * - `profile.heroSubtitle`  → subtítulo
 * - `profile.avatarUrl`     → foto (via SmartImage)
 * - `profile.email`         → link do CTA "Entrar em contato"
 * - `profile.resumeUrl`     → botão "Meu currículo" (condicional)
 *
 * Sobre os CTAs:
 * - "Ver projetos" → `/projetos` (Link interno do React Router).
 * - "Entrar em contato" → `mailto:email` se houver email cadastrado,
 *   senão vira Link para `/contato`.
 * - "Meu currículo" só aparece se `resumeUrl` estiver definido.
 *
 * Performance:
 * - O avatar usa `priority` no SmartImage (lazy vs eager).
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Download, FileText } from "lucide-react";
import Container from "../layout/Container";
import SmartImage from "../layout/SmartImage";
import { useProfile } from "../../hooks/useProfile";

export default function Hero() {
  const { profile } = useProfile();

  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-[var(--color-border)]"
    >
      <Container className="pt-10 pb-16 sm:pt-14 sm:pb-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-left"
          >
            <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
              {profile?.role || "Software Developer"}
            </span>

            <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-foreground)] sm:text-6xl lg:text-7xl">
              {profile?.heroTitle ||
                "Construindo software com propósito e atenção aos detalhes."}
            </h1>

            <p className="mt-6 text-base leading-7 text-[var(--color-muted)] sm:text-lg sm:leading-8 max-w-2xl">
              {profile?.heroSubtitle ||
                "Especializado em desenvolvimento de aplicações modernas, focadas em alta performance, arquitetura limpa e excelente experiência de uso."}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/projetos"
                className="bg-brand rounded-full px-8 h-12 flex items-center text-sm font-medium text-[#0d2119] hover:bg-brand-hover transition-colors duration-150"
              >
                Ver projetos
              </Link>

              {profile?.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="border border-[var(--color-border)] rounded-full px-8 h-12 flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors duration-200"
                >
                  <span>Entrar em contato</span>
                  <ArrowUpRight size={16} />
                </a>
              ) : (
                <Link
                  to="/contato"
                  className="border border-[var(--color-border)] rounded-full px-8 h-12 flex items-center text-sm font-medium text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors duration-200"
                >
                  Entrar em contato
                </Link>
              )}

              {profile?.resumeUrl && (
                <motion.a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-brand/30 bg-brand/10 px-6 py-3 text-sm font-medium text-brand-deep hover:bg-brand/20 hover:border-brand/50 transition-all"
                >
                  <FileText size={16} />
                  <span>Meu currículo</span>
                  <Download
                    size={14}
                    className="opacity-70 group-hover:translate-y-0.5 transition-transform"
                  />
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-square w-64 sm:w-80 lg:w-96 rounded-2xl overflow-hidden border border-white/10 bg-[var(--color-card)] shadow-2xl"
            >
              <SmartImage
                src={profile?.avatarUrl}
                alt={profile?.name || "Foto de Perfil"}
                priority
                className="h-full w-full object-cover"
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-[#1b1f23]/45 via-transparent to-transparent">
                    <span className="text-sm font-medium text-[var(--color-muted)] tracking-wider uppercase">
                      [ Sua Foto ]
                    </span>
                  </div>
                }
              />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
