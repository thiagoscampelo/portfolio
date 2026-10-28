/**
 * ExperienceTimelineFull — Item de timeline vertical narrativa.
 *
 * Uso: página `/experiencia` (trajetória completa).
 *
 * Diferenças vs. `ExperienceCard`:
 * - Formato vertical (não card): dot + linha conectora + conteúdo à direita.
 * - Cargo maior (`text-2xl`) — leitura mais editorial, item a item.
 * - Descrição sem truncamento (`line-clamp`) — o usuário está aqui para
 *   ler tudo.
 * - Sem hover states — o item não é clicável (não navega para lugar algum).
 *
 * Conector vertical:
 * - A linha cinza entre o dot atual e o próximo item (`!isLast`).
 * - O último item não renderiza linha, fechando a timeline.
 *
 * Prop `isLast`:
 * - Controlada pelo componente pai (map em `/experiencia`), que passa
 *   `isLast={index === experiences.length - 1}`.
 */
import { motion } from "framer-motion";
import type { Experience } from "../../types";

interface ExperienceTimelineFullProps {
  experience: Experience;
  index: number;
  isLast?: boolean;
}

export default function ExperienceTimelineFull({
  experience,
  index,
  isLast = false,
}: ExperienceTimelineFullProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative grid grid-cols-[24px_1fr] gap-6 pb-12 last:pb-0"
    >
      {/* Conector + dot */}
      <div className="relative flex justify-center">
        {!isLast && (
          <span
            aria-hidden
            className="absolute top-4 bottom-0 left-1/2 w-px -translate-x-1/2 bg-[var(--color-border)]"
          />
        )}
        <span className="relative z-10 mt-1.5 h-3 w-3 rounded-full border-2 border-brand bg-[var(--color-background)]" />
      </div>

      {/* Conteúdo */}
      <div>
        <span className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {experience.period}
        </span>

        <h3 className="mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] leading-tight">
          {experience.role}
        </h3>

        <p className="mt-1 text-sm font-medium text-brand-deep">
          {experience.company}
        </p>

        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)] max-w-2xl">
          {experience.description}
        </p>

        {experience.technologies && experience.technologies.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-muted)]/70">
            {experience.technologies.map((tech, i) => (
              <span key={tech} className="flex items-center gap-2.5">
                {i > 0 && <span className="text-[var(--color-border)]">·</span>}
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
