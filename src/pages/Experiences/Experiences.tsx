/**
 * Experiences — Página `/experiencia` (trajetória completa).
 *
 * Diferente da seção de Experiência da Home (que mostra 3 cards em grid),
 * aqui exibimos **todas** as experiências publicadas em formato de timeline
 * vertical narrativa.
 *
 * Estrutura:
 * - Hero (border-b): eyebrow + H1 + subtítulo editáveis via `site_content`.
 * - Timeline: `<ExperienceTimelineFull />` para cada item, com `isLast`
 *   calculado no map para fechar a linha conectora no último item.
 *
 * Fluxo de navegação:
 * - A Home e a `/sobre` mostram até 3 experiências + link "Ver trajetória
 *   completa" → aponta pra cá.
 * - Aqui o usuário vê o histórico inteiro.
 *
 * Estados: loading (skeletons com dot + linha), erro, vazio.
 */
import { motion } from "framer-motion";
import Container from "../../components/layout/Container";
import Skeleton from "../../components/layout/Skeleton";
import PageMeta from "../../components/layout/PageMeta";
import ExperienceTimelineFull from "../../components/experience/ExperienceTimelineFull";
import { useExperiences } from "../../hooks/useExperiences";
import { useSiteContent } from "../../hooks/useSiteContent";

export default function Experiences() {
  const { experiences, loading, error } = useExperiences();
  const { content } = useSiteContent();

  return (
    <>
      <PageMeta
        title="Experiência"
        description={
          content.experience_hero_subtitle ||
          "Minha trajetória profissional completa — empresas, cargos e tecnologias."
        }
      />

      <div className="pt-6 pb-16 sm:pt-10 sm:pb-20">
        {/* Hero */}
        <section className="border-b border-[var(--color-border)] pb-12 sm:pb-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
                {content.experience_hero_eyebrow || "Trajetória"}
              </span>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-foreground)] sm:text-6xl lg:text-7xl">
                {content.experience_hero_title || "Experiência profissional."}
              </h1>
              <p className="mt-6 text-base leading-7 text-[var(--color-muted)] sm:text-lg sm:leading-8 max-w-2xl">
                {content.experience_hero_subtitle ||
                  "Um panorama do meu percurso e das tecnologias com que tenho trabalhado ao longo do tempo."}
              </p>
            </motion.div>
          </Container>
        </section>

        {/* Timeline */}
        <section className="pt-12 sm:pt-16">
          <Container>
            {loading ? (
              <div className="max-w-3xl">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[24px_1fr] gap-6 pb-12"
                  >
                    <div className="flex justify-center">
                      <Skeleton className="h-3 w-3 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-7 w-2/3" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-400 font-medium">
                {error}
              </div>
            ) : experiences.length === 0 ? (
              <div className="py-16 text-center text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
                Nenhuma experiência cadastrada até ao momento.
              </div>
            ) : (
              <div className="max-w-3xl">
                {experiences.map((exp, index) => (
                  <ExperienceTimelineFull
                    key={exp.id}
                    experience={exp}
                    index={index}
                    isLast={index === experiences.length - 1}
                  />
                ))}
              </div>
            )}
          </Container>
        </section>
      </div>
    </>
  );
}
