/**
 * AboutPreview — Seção "02 — Sobre" da Home.
 *
 * Layout assimétrico em grid (`[0.7fr_1.3fr]`): label + título à esquerda,
 * conteúdo editorial à direita.
 *
 * Fonte de dados:
 * - `profile.aboutTitle`       → título editável via aba "Textos da Home"
 * - `profile.bio`              → parágrafo principal (a "grandona")
 * - `profile.aboutPhilosophy`  → parágrafo complementar (opcional)
 *
 * Link "Conheça minha trajetória" leva para `/sobre`, onde a bio completa
 * aparece com mais contexto (filosofia, formação, experiência).
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Container from "../layout/Container";
import SectionHeading from "../layout/SectionHeading";
import { useProfile } from "../../hooks/useProfile";

export default function AboutPreview() {
  const { profile } = useProfile();

  return (
    <section id="sobre" className="border-b border-[var(--color-border)]">
      <Container className="py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeading
              index="02"
              label="Sobre"
              title={profile?.aboutTitle || "Um pouco sobre mim."}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            <p className="text-xl sm:text-2xl font-normal leading-relaxed tracking-[-0.01em] text-[var(--color-foreground)]">
              {profile?.bio ||
                "Desenvolvo produtos digitais focados na interseção entre engenharia de software sólida, arquitetura limpa e interfaces refinadas."}
            </p>

            {profile?.aboutPhilosophy && (
              <p className="text-base sm:text-lg leading-relaxed text-[var(--color-muted)]">
                {profile.aboutPhilosophy}
              </p>
            )}

            <div className="pt-4">
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)] hover:text-indigo-400 transition-colors group"
              >
                Conheça minha trajetória
                <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
