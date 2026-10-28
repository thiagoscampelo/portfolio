/**
 * ExperiencePreview — Seção "03 — Experiência" da Home.
 *
 * Mostra até 3 experiências em formato de grid de cards. Se houver mais
 * de 3, aparece o link "Ver trajetória completa" que aponta para
 * `/experiencia` (página dedicada com timeline completa).
 *
 * Estrutura visual:
 * - Header em cima (título + descrição + botão CV alinhado à direita
 *   quando o usuário tem `resumeUrl`).
 * - Grid de 3 cards (`ExperienceCard`) com entrada escalonada.
 *
 * Fonte de dados:
 * - `useExperiences()` — todas as experiências publicadas.
 * - `useSiteContent()` — título e descrição editáveis via admin.
 * - `profile.resumeUrl` — botão "Meu currículo" (condicional).
 *
 * Limite:
 * - Constante `LIMIT = 3`. O admin avisa quando o número de experiências
 *   publicadas passa de 3 (badge "Exibidas na Home: X/3").
 */
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../layout/Container";
import SectionHeading from "../layout/SectionHeading";
import Skeleton from "../layout/Skeleton";
import ExperienceCard from "../experience/ExperienceCard";
import { useProfile } from "../../hooks/useProfile";
import { useExperiences } from "../../hooks/useExperiences";
import { useSiteContent } from "../../hooks/useSiteContent";

const LIMIT = 3;

export default function ExperiencePreview() {
  const { profile } = useProfile();
  const { experiences, loading } = useExperiences();
  const { content } = useSiteContent();

  const visible = experiences.slice(0, LIMIT);
  const hasMore = experiences.length > LIMIT;

  return (
    <section id="experiencia" className="border-b border-[var(--color-border)]">
      <Container className="py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12"
        >
          <SectionHeading
            index="03"
            label="Experiência"
            title={content.home_experience_title || "Minha trajetória."}
            description={
              content.home_experience_description ||
              "Um resumo do meu percurso profissional e das principais tecnologias com que tenho trabalhado."
            }
          />

          {profile?.resumeUrl && (
            <motion.a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-brand/30 bg-brand/10 px-6 py-3 text-sm font-medium text-brand-deep hover:bg-brand/20 hover:border-brand/50 transition-colors group shrink-0"
            >
              <FileText
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              <span>Meu currículo</span>
              <Download
                size={14}
                className="opacity-70 group-hover:translate-y-0.5 transition-transform"
              />
            </motion.a>
          )}
        </motion.div>

        {/* Grid de cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] p-6"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
            Nenhuma experiência cadastrada até ao momento.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((exp, index) => (
                <ExperienceCard key={exp.id} experience={exp} index={index} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10">
                <Link
                  to="/experiencia"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors group"
                >
                  Ver trajetória completa
                  <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
