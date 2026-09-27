/**
 * Projects — Página `/projetos` (listagem completa).
 *
 * Responsabilidade:
 * - Exibe todos os projetos com `published = true` em grid de 2 colunas.
 * - Serve como "ver todos" a partir da Home (`FeaturedProjects`).
 *
 * Estrutura:
 * - Hero (border-b) com eyebrow + H1 + subtítulo (textos editáveis via
 *   `site_content` no admin).
 * - Grid com `ProjectCard` (formato grande).
 * - Estados: loading (skeletons), erro (mensagem vermelha), vazio (card
 *   tracejado).
 *
 * Metadados:
 * - `PageMeta` define title, description, canonical, OG tags.
 *
 * Diferença vs. Home:
 * - Aqui é grid de **2 colunas** com `ProjectCard` grande.
 * - Na Home é grid de **3 colunas** com `ProjectCardCompact`.
 */
import { motion } from "framer-motion";
import Container from "../../components/layout/Container";
import ProjectCard from "../../components/projects/ProjectCard";
import Skeleton from "../../components/layout/Skeleton";
import PageMeta from "../../components/layout/PageMeta";
import { useProjects } from "../../hooks/useProjects";
import { useSiteContent } from "../../hooks/useSiteContent";

export default function Projects() {
  const { projects, loading, error } = useProjects();
  const { content } = useSiteContent();

  return (
    <>
      <PageMeta
        title="Projetos"
        description={
          content.projects_hero_subtitle ||
          "Uma coleção de aplicações e soluções em que trabalhei."
        }
      />

      <div className="pt-6 pb-16 sm:pt-10 sm:pb-20">
        {/* ═══════════ HERO ═══════════ */}
        <section className="border-b border-[var(--color-border)] pb-12 sm:pb-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
                {content.projects_hero_eyebrow || "Portfólio"}
              </span>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-foreground)] sm:text-6xl lg:text-7xl">
                {content.projects_hero_title || "Projetos selecionados."}
              </h1>
              <p className="mt-6 text-base leading-7 text-[var(--color-muted)] sm:text-lg sm:leading-8 max-w-2xl">
                {content.projects_hero_subtitle ||
                  "Uma coleção de aplicações e soluções em que trabalhei."}
              </p>
            </motion.div>
          </Container>
        </section>

        {/* ═══════════ GRID ═══════════ */}
        <section className="pt-12 sm:pt-16">
          <Container>
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-[16/10] rounded-2xl" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="py-16 text-center text-red-400 font-medium">
                {error}
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div className="py-16 text-center text-[var(--color-muted)] font-medium border border-dashed border-[var(--color-border)] rounded-2xl">
                Nenhum projeto cadastrado ou publicado até ao momento.
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
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
