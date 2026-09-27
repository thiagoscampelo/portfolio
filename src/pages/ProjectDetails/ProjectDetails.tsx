/**
 * ProjectDetails — Página `/projetos/:slug` (projeto individual).
 *
 * Três estados renderizados:
 * 1. **Loading** — skeleton tipográfico (título + descrição).
 * 2. **Não encontrado** — slug inválido ou projeto despublicado. Mostra
 *    estado "Projeto não encontrado" com link de volta. Mesmo padrão
 *    tipográfico do 404 público.
 * 3. **Sucesso** — página completa.
 *
 * Estrutura do estado de sucesso:
 * - Hero (border-b): link "← Voltar", label "Projeto", H1, descrição.
 * - Banner: imagem de capa em `aspect-video` (com fallback se não houver).
 * - Grid `[0.7fr_1.3fr]`:
 *   - Esquerda: tecnologias + links externos (GitHub, demo).
 *   - Direita: conteúdo detalhado em `whitespace-pre-line`.
 *
 * Metadados dinâmicos:
 * - `PageMeta` recebe título, descrição e imagem de capa do próprio
 *   projeto. Isso gera preview de compartilhamento específico por projeto
 *   (com a capa como OG image).
 *
 * Navegação:
 * - O link "← Voltar" é inteligente: volta para `/projetos` (não usa
 *   `history.back()`, que seria imprevisível em links compartilhados).
 */
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import Container from "../../components/layout/Container";
import { useProjectBySlug } from "../../hooks/useProjects";
import PageMeta from "../../components/layout/PageMeta";
import SmartImage from "../../components/layout/SmartImage";
import Markdown from "../../components/layout/Markdown.tsx";

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { project, loading, error } = useProjectBySlug(slug);

  /* ─────────── Loading (skeleton) ─────────── */
  if (loading) {
    return (
      <div className="pt-6 pb-16 sm:pt-10 sm:pb-20">
        <Container>
          <div className="animate-pulse flex flex-col gap-6 max-w-3xl">
            <div className="h-4 w-24 bg-[var(--color-border)]/40 rounded" />
            <div className="h-16 w-3/4 bg-[var(--color-border)]/40 rounded" />
            <div className="h-4 w-full bg-[var(--color-border)]/30 rounded" />
            <div className="h-4 w-2/3 bg-[var(--color-border)]/30 rounded" />
          </div>
        </Container>
      </div>
    );
  }

  /* ─────────── Não encontrado ─────────── */
  if (error || !project) {
    return (
      <>
        <PageMeta title="Projeto não encontrado" />
        <div className="pt-20 pb-16 sm:pt-28 sm:pb-20">
          <Container>
            <div className="max-w-2xl">
              <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
                404
              </span>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-foreground)] sm:text-6xl">
                Projeto não encontrado.
              </h1>
              <p className="mt-6 text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                O projeto que procura não existe ou foi removido.
              </p>
              <Link
                to="/projetos"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group"
              >
                <span className="transition-transform duration-200 group-hover:-translate-x-1">
                  ←
                </span>
                Voltar para todos os projetos
              </Link>
            </div>
          </Container>
        </div>
      </>
    );
  }

  /* ─────────── Conteúdo ─────────── */
  const hasLinks = project.githubUrl || project.demoUrl;

  return (
    <>
      <PageMeta
        title={project.title}
        description={project.description}
        image={project.coverImage ?? undefined}
      />
      <div className="pt-6 pb-16 sm:pt-10 sm:pb-20">
        {/* ═══════════ HERO ═══════════ */}
        <section className="border-b border-[var(--color-border)] pb-12 sm:pb-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <Link
                to="/projetos"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors mb-8 group"
              >
                <span className="transition-transform duration-200 group-hover:-translate-x-1">
                  ←
                </span>
                Voltar para projetos
              </Link>

              <span className="block text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Projeto
              </span>

              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-foreground)] sm:text-6xl lg:text-7xl">
                {project.title}
              </h1>

              <p className="mt-6 text-base leading-7 text-[var(--color-muted)] sm:text-xl sm:leading-8 max-w-3xl">
                {project.description}
              </p>
            </motion.div>
          </Container>
        </section>

        {/* ═══════════ IMAGEM PRINCIPAL ═══════════ */}
        <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full max-h-[80vh] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-sm flex items-center justify-center"
            >
              <SmartImage
                src={project.coverImage}
                alt={project.title}
                className="w-full h-auto max-h-[80vh] object-contain"
                fallback={
                  <div className="aspect-video w-full flex items-center justify-center">
            <span className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted)]">
              [ Imagem / Banner Principal do Projeto ]
            </span>
                  </div>
                }
              />
            </motion.div>
          </Container>
        </section>

        {/* ═══════════ CONTEÚDO + META ═══════════ */}
        <section className="pt-12 sm:pt-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
              {/* Esquerda — metadados */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-10"
              >
                {project.technologies && project.technologies.length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)] block mb-4">
                      Tecnologias
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)] bg-[var(--color-card)] px-3 py-1 rounded-full border border-[var(--color-border)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasLinks && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)] block mb-4">
                      Links
                    </span>
                    <div className="flex flex-col gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)] hover:text-indigo-400 transition-colors group"
                        >
                          Ver no GitHub
                          <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                            ↗
                          </span>
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)] hover:text-indigo-400 transition-colors group"
                        >
                          Ver projeto online
                          <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                            ↗
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Direita — conteúdo detalhado (markdown) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Markdown>{project.content}</Markdown>
              </motion.div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
