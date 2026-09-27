/**
 * ExperienceCard — Card de experiência em formato de grid (3 colunas).
 *
 * Uso: seção "03 — Experiência" da Home e seção "02 — Trajetória" de `/sobre`.
 *
 * Para a timeline completa (página `/experiencia`), usar
 * `ExperienceTimelineFull` — formato diferente, mais narrativo.
 *
 * Estrutura:
 * - Período com dot indigo à esquerda (indicador visual).
 * - Cargo (título do card).
 * - Empresa em indigo (destaque).
 * - Descrição truncada em 3 linhas.
 * - Tecnologias em linha única separadas por `·`.
 *
 * Interações:
 * - Hover: borda indigo, fundo indigo sutil, título indigo.
 */
import { motion } from "framer-motion";
import type { Experience } from "../../types";

interface ExperienceCardProps {
  experience: Experience;
  index: number;
}

export default function ExperienceCard({
  experience,
  index,
}: ExperienceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex flex-col h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-sm p-6 hover:border-indigo-500/40 hover:bg-indigo-500/[0.03] transition-all duration-200"
    >
      {/* Período + dot */}
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
        <span className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {experience.period}
        </span>
      </div>

      {/* Cargo */}
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[var(--color-foreground)] leading-tight group-hover:text-indigo-400 transition-colors">
        {experience.role}
      </h3>

      {/* Empresa */}
      <p className="mt-1 text-sm font-medium text-indigo-400">
        {experience.company}
      </p>

      {/* Descrição */}
      <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)] line-clamp-3 flex-1">
        {experience.description}
      </p>

      {/* Techs */}
      {experience.technologies && experience.technologies.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[var(--color-border)]/60 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-muted)]/70">
          {experience.technologies.map((tech, i) => (
            <span key={tech} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-[var(--color-border)]">·</span>}
              {tech}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
