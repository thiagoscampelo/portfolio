/**
 * About — Página `/sobre` (trajetória completa + filosofia).
 *
 * Estrutura (6 seções):
 * - **Hero** (border-b): avatar à direita, título + bio à esquerda.
 * - **01 — Filosofia**: texto de `profile.aboutPhilosophy`.
 * - **02 — Trajetória**: 3 primeiros cards de experiência + link
 *   "Ver trajetória completa" para `/experiencia` (se houver mais de 3).
 * - **03 — Formação**: lista vertical com período, curso, instituição.
 * - **04 — Ferramentas**: grid de skills em cards compactos.
 * - **05 — Áreas de interesse**: chips com `profile.interests`.
 *   Seção só renderiza se houver itens.
 * - **CTA final**: "Quer conhecer meu trabalho de perto?" com botões de
 *   CV e "Ver projetos".
 *
 * Fontes de dados:
 * - `useProfile`      → bio, título, filosofia, avatar, interesses, CV.
 * - `useSkills`       → habilidades publicadas.
 * - `useExperiences`  → experiências publicadas (limitadas a 3 aqui).
 * - `useEducation`    → formação acadêmica.
 * - `useSiteContent`  → textos editáveis (labels + títulos das seções).
 *
 * Limites:
 * - Trajetória mostra só 3 itens. Formação e ferramentas mostram todos.
 */
import { motion } from "framer-motion";
import { FileText, Download, BadgeCheck, BookOpen, GraduationCap, Wrench, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import Skeleton from "../../components/layout/Skeleton";
import PageMeta from "../../components/layout/PageMeta";
import { useProfile } from "../../hooks/useProfile";
import { useSkills } from "../../hooks/useSkills";
import { useExperiences } from "../../hooks/useExperiences";
import { useEducation } from "../../hooks/useEducation";
import { useSiteContent } from "../../hooks/useSiteContent";
import ExperienceCard from "../../components/experience/ExperienceCard";
import type { EducationType } from "../../types";

export default function About() {
  const { profile } = useProfile();
  const { skills, loading: loadingSkills } = useSkills();
  const { experiences, loading: loadingExp } = useExperiences();
  const { education, loading: loadingEdu } = useEducation();
  const { content } = useSiteContent();

  const interests = profile?.interests || [];

  /**
   * Configuração visual por tipo de formação.
   * Duplicada em relação ao admin de propósito: cada contexto
   * (admin/público) pode evoluir o estilo de forma independente.
   */
  const EDUCATION_TYPE_META: Record<
    EducationType,
    { label: string; icon: LucideIcon; badgeClass: string }
  > = {
    degree: {
      label: "Graduação",
      icon: GraduationCap,
      badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    technical: {
      label: "Curso técnico",
      icon: Wrench,
      badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
    certification: {
      label: "Certificação",
      icon: BadgeCheck,
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    course: {
      label: "Curso livre",
      icon: BookOpen,
      badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
  };

  return (
    <>
      <PageMeta
        title="Sobre"
        description={
          profile?.bio ||
          "Conheça minha trajetória, filosofia de trabalho e habilidades técnicas."
        }
      />

      <div className="pt-6 pb-16 sm:pt-10 sm:pb-20">
        {/* ═══════════ HERO ═══════════ */}
        <section className="border-b border-[var(--color-border)] pb-12 sm:pb-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Sobre
                </span>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-foreground)] sm:text-6xl lg:text-7xl">
                  {profile?.aboutTitle || "Um pouco sobre mim."}
                </h1>
                <p className="mt-6 text-base leading-7 text-[var(--color-muted)] sm:text-xl sm:leading-8 max-w-2xl">
                  {profile?.bio ||
                    "Desenvolvo produtos digitais focados na interseção entre engenharia de software sólida, arquitetura limpa e interfaces refinadas."}
                </p>
                {profile?.location && (
                  <p className="mt-6 text-xs font-mono uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                    {profile.location}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative aspect-square w-56 sm:w-72 lg:w-80 rounded-2xl overflow-hidden border border-white/10 bg-[var(--color-card)]">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name || "Foto de Perfil"}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-indigo-950/20 via-transparent to-transparent">
                      <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                        [ Sua Foto ]
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* ═══════════ 01 — FILOSOFIA ═══════════ */}
        <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
              >
                <SectionHeading
                  index="01"
                  label={content.about_philosophy_label || "Filosofia"}
                  title={content.about_philosophy_title || "Como eu penso."}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <p className="text-xl sm:text-2xl font-normal leading-relaxed tracking-[-0.01em] text-[var(--color-foreground)]">
                  {profile?.aboutPhilosophy ||
                    "Acredito que bom software nasce da combinação entre decisões técnicas conscientes e atenção obsessiva aos detalhes de experiência."}
                </p>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* ═══════════ 02 — TRAJETÓRIA PROFISSIONAL ═══════════ */}
        <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <SectionHeading
                index="02"
                label={content.about_trajectory_label || "Trajetória"}
                title={
                  content.about_trajectory_title || "Experiência profissional."
                }
                description={
                  content.about_trajectory_description ||
                  "Um panorama do meu percurso e das tecnologias com que tenho trabalhado."
                }
              />
            </motion.div>

            {loadingExp ? (
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
                  {experiences.slice(0, 3).map((exp, index) => (
                    <ExperienceCard
                      key={exp.id}
                      experience={exp}
                      index={index}
                    />
                  ))}
                </div>

                {experiences.length > 3 && (
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

        {/* ═══════════ 03 — FORMAÇÃO ═══════════ */}
        <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
              >
                <SectionHeading
                  index="03"
                  label={content.about_education_label || "Formação"}
                  title={content.about_education_title || "Base acadêmica."}
                  description={
                    content.about_education_description ||
                    "Formação formal que sustenta a prática profissional."
                  }
                />
              </motion.div>

              <div className="border-t border-[var(--color-border)]">
                {loadingEdu ? (
                  <>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="py-8 sm:py-10 border-b border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 items-start"
                      >
                        <Skeleton className="h-4 w-24" />
                        <div className="flex flex-col gap-3">
                          <Skeleton className="h-6 w-2/3" />
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : education.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
                    Nenhuma formação cadastrada até ao momento.
                  </div>
                ) : (
                  education.map((edu, index) => {
                    const meta = EDUCATION_TYPE_META[edu.type];
                    const TypeIcon = meta.icon;
                    return (
                      <motion.article
                        key={edu.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="py-8 sm:py-10 border-b border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 items-start"
                      >
                        <span className="text-sm font-medium text-[var(--color-muted)]">
                          {edu.period}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${meta.badgeClass}`}
                            >
                              <TypeIcon size={11} />
                              {meta.label}
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold text-[var(--color-foreground)]">
                            {edu.course}
                          </h3>
                          <p className="text-sm font-medium text-indigo-400 mt-1">
                            {edu.institution}
                          </p>
                          {edu.description && (
                            <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      </motion.article>
                    );
                  })
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* ═══════════ 04 — FERRAMENTAS ═══════════ */}
        <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
              >
                <SectionHeading
                  index="04"
                  label={content.about_tools_label || "Ferramentas"}
                  title={
                    content.about_tools_title || "Tecnologias & habilidades."
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {loadingSkills ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))
                ) : skills.length === 0 ? (
                  <div className="py-16 col-span-full text-center text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
                    Nenhuma competência cadastrada.
                  </div>
                ) : (
                  skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center text-sm font-medium text-[var(--color-foreground)] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors duration-200"
                    >
                      {skill.name}
                    </div>
                  ))
                )}
              </motion.div>
            </div>
          </Container>
        </section>

        {/* ═══════════ 05 — ÁREAS DE INTERESSE ═══════════ */}
        {interests.length > 0 && (
          <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                >
                  <SectionHeading
                    index="05"
                    label={
                      content.about_interests_label || "Áreas de interesse"
                    }
                    title={
                      content.about_interests_title ||
                      "O que me move profissionalmente."
                    }
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-wrap gap-3"
                >
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-card)] border border-[var(--color-border)] px-4 py-2 rounded-full hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors duration-200"
                    >
                      {interest}
                    </span>
                  ))}
                </motion.div>
              </div>
            </Container>
          </section>
        )}

        {/* ═══════════ CTA FINAL ═══════════ */}
        <section className="pt-12 sm:pt-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8"
            >
              <div>
                <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Próximo passo
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)] sm:text-5xl max-w-xl">
                  {content.about_cta_title ||
                    "Quer conhecer meu trabalho de perto?"}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {profile?.resumeUrl && (
                  <motion.a
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-6 py-3 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all"
                  >
                    <FileText size={16} />
                    <span>Meu currículo</span>
                    <Download
                      size={14}
                      className="opacity-70 group-hover:translate-y-0.5 transition-transform"
                    />
                  </motion.a>
                )}

                <Link
                  to="/projetos"
                  className="bg-indigo-600 rounded-full px-6 py-3 flex items-center text-sm font-medium text-white shadow-[0_0_40px_-5px_rgba(79,70,229,0.5)] hover:bg-indigo-500 hover:-translate-y-1 hover:shadow-[0_0_60px_-5px_rgba(99,102,241,0.8)] active:scale-[0.98] transition-all duration-300"
                >
                  Ver projetos
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>
      </div>
    </>
  );
}
