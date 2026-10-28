/**
 * ContactCTA — Seção "04 — Contato" da Home.
 *
 * Encerramento editorial da Home: H2 gigante (`text-8xl` em lg) com
 * CTA de e-mail clicável. É o ponto de conversão principal da página.
 *
 * Fonte de dados:
 * - `profile.contactTitle`     → título editável (fallback hardcoded)
 * - `profile.contactSubtitle`  → subtítulo
 * - `profile.email`            → e-mail do link `mailto:`
 *
 * Layout:
 * - `flex-col lg:flex-row items-end justify-between` — título à
 *   esquerda (grande), link de e-mail à direita, alinhados pela base.
 */
import { motion } from "framer-motion";
import Container from "../layout/Container";
import { useProfile } from "../../hooks/useProfile";

export default function ContactCTA() {
  const { profile } = useProfile();
  const email = profile?.email || "contato@tscampelo.com.br";

  return (
    <section id="contato">
      <Container className="py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
              04 — Contato
            </span>

            <h2 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-[var(--color-foreground)] sm:text-7xl lg:text-8xl leading-[0.95]">
              {profile?.contactTitle ? (
                profile.contactTitle
              ) : (
                <>
                  Vamos construir <br /> algo juntos?
                </>
              )}
            </h2>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[var(--color-muted)] max-w-xl">
              {profile?.contactSubtitle ||
                "Estou sempre aberto a discutir novas oportunidades, projetos desafiadores ou simplesmente trocar ideias sobre desenvolvimento de software."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full lg:w-auto"
          >
            <a
              href={`mailto:${email}`}
              className="group inline-flex items-center gap-4 text-xl sm:text-2xl font-medium text-[var(--color-foreground)] hover:text-brand-deep transition-colors border-b border-[var(--color-border)] hover:border-brand-deep pb-2"
            >
              {email}
              <span className="text-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </a>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
