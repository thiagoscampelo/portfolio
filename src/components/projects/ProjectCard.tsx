/**
 * ProjectCard — Card de projeto em formato grande (2 colunas).
 *
 * Uso principal: página `/projetos` (grid de 2 colunas em desktop).
 * Para a Home (grid de 3), usar `ProjectCardCompact`.
 *
 * Estrutura:
 * - Thumbnail (aspect 16:10) com imagem de capa ou fallback tracejado.
 * - Número do item + seta ↗ (animada no hover).
 * - Título (com verde da marca no hover).
 * - Descrição truncada em 2 linhas.
 * - Tecnologias em chips (todas).
 *
 * Interações:
 * - Hover: imagem dá zoom (scale 105), título fica verde, seta anima.
 * - Click: navega para `/projetos/:slug`.
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Project } from "../../types";
import SmartImage from "../layout/SmartImage";
import { ImageIcon } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative flex flex-col"
    >
      <Link to={`/projetos/${project.slug}`} className="block">
        {/* Thumbnail */}
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] relative">
          <SmartImage
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-card)]/60 group-hover:scale-[1.02] transition-transform duration-500">
                <ImageIcon
                  size={28}
                  className="text-[var(--color-muted)]/40"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.18em]">
                  Sem imagem
                </span>
              </div>
            }
          />
        </div>

        {/* Detalhes */}
        <div className="mt-6 flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-lg text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] group-hover:text-brand-deep transition-colors">
            {project.title}
          </h3>

          <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)] line-clamp-2">
            {project.description}
          </p>

          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)] bg-[var(--color-card)] px-3 py-1 rounded-full border border-[var(--color-border)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
