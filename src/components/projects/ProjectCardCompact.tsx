/**
 * ProjectCardCompact — Card de projeto em formato compacto (3 colunas).
 *
 * Uso principal: seção "01 — Projetos" da Home.
 * Para a página `/projetos` (2 colunas), usar `ProjectCard`.
 *
 * Diferenças vs. `ProjectCard`:
 * - Título menor (`text-lg` vs `text-2xl`).
 * - Descrição truncada em 2 linhas.
 * - Tecnologias limitadas a 4 (slice), separadas por `·` em vez de chips.
 * - Aparência mais "editorial" para caber em grid de 3 sem competir com
 *   o conteúdo adjacente.
 *
 * Interações: idênticas ao `ProjectCard`.
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import SmartImage from "../layout/SmartImage";
import type { Project } from "../../types";

interface ProjectCardCompactProps {
  project: Project;
  index: number;
}

export default function ProjectCardCompact({
  project,
  index,
}: ProjectCardCompactProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex flex-col h-full"
    >
      <Link to={`/projetos/${project.slug}`} className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 relative">
          <SmartImage
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-card)]/60">
                <ImageIcon
                  size={24}
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
        <div className="mt-5 flex flex-col flex-1">
          {/* Número + seta */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--color-muted)]/60">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-lg text-[var(--color-muted)] group-hover:text-indigo-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-foreground)] leading-tight group-hover:text-indigo-400 transition-colors">
            {project.title}
          </h3>

          {/* Descrição */}
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)] line-clamp-2 flex-1">
            {project.description}
          </p>

          {/* Tecnologias */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-muted)]/70">
              {project.technologies.slice(0, 4).map((tech, i) => (
                <span key={tech} className="flex items-center gap-2.5">
                  {i > 0 && (
                    <span className="text-[var(--color-border)]">·</span>
                  )}
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
