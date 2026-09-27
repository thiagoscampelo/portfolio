/**
 * FeaturedProjects — Seção "01 — Projetos" da Home.
 *
 * Exibe até 3 projetos marcados como `featured: true` no banco.
 * Se houver mais de 3 destacados, aparece o link "Ver todos os projetos"
 * no fim da seção.
 *
 * Fonte de dados:
 * - `useProjects({ featuredOnly: true })` — filtra `featured = true` e
 *   ordena por `order` no Supabase.
 * - `content.home_projects_title` — título editável via admin.
 *
 * Estados renderizados:
 * - **Loading**: grid de 3 skeletons.
 * - **Erro**: mensagem em vermelho.
 * - **Vazio**: card tracejado com mensagem.
 * - **Sucesso**: grid responsivo (1/2/3 colunas) + link "Ver todos"
 *   condicional.
 *
 * Limite de 3:
 * - Constante `LIMIT`. A Home tem um teto visual para manter o ritmo
 *   editorial. Projetos além disso ficam acessíveis em `/projetos`.
 * - O admin mostra um badge "Destaques na Home: X/3" para avisar quando
 *   o limite é ultrapassado.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../layout/Container";
import SectionHeading from "../layout/SectionHeading";
import Skeleton from "../layout/Skeleton";
import ProjectCardCompact from "../projects/ProjectCardCompact";
import { useProjects } from "../../hooks/useProjects";
import { useSiteContent } from "../../hooks/useSiteContent";

const LIMIT = 3;

export default function FeaturedProjects() {
  const { projects, loading, error } = useProjects({ featuredOnly: true });
  const { content } = useSiteContent();

  const visible = projects.slice(0, LIMIT);
  const hasMore = projects.length > LIMIT;

  return (
    <section id="projetos" className="border-b border-[var(--color-border)]">
      <Container className="py-16 sm:py-24">
        {/* Header full-width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <SectionHeading
            index="01"
            label="Projetos"
            title={content.home_projects_title || "Projetos selecionados."}
          />
        </motion.div>

        {/* Estados */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[16/10] rounded-2xl" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
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
          <div className="py-16 text-center text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
            Nenhum projeto em destaque publicado até ao momento.
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {visible.map((project, index) => (
                <ProjectCardCompact
                  key={project.id}
                  project={project}
                  index={index}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12">
                <Link
                  to="/projetos"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors group"
                >
                  Ver todos os projetos
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
