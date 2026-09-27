/**
 * SectionHeading — Cabeçalho padronizado de seção.
 *
 * Padrão editorial do site: cada seção numerada tem um label em uppercase
 * com prefixo `XX — NOME` e um título grande em semibold.
 *
 * Exemplo renderizado:
 *   ┌─────────────────────────────┐
 *   │ 01 — PROJETOS               │
 *   │ Projetos selecionados.      │
 *   │ Descrição opcional...       │
 *   └─────────────────────────────┘
 *
 * Props:
 * - `index`       — número da seção (opcional). Quando passado, é prefixado
 *                   ao label com um travessão em dash.
 * - `label`       — nome curto da seção (ex: "Projetos").
 * - `title`       — título editorial.
 * - `description` — parágrafo opcional abaixo do título.
 *
 * Usado em praticamente todas as seções públicas para garantir consistência
 * tipográfica — se o estilo precisa mudar, muda em um lugar só.
 */
interface SectionHeadingProps {
  index?: string;
  label: string;
  title: string;
  description?: string;
}

export default function SectionHeading({
  index,
  label,
  title,
  description,
}: SectionHeadingProps) {
  const eyebrow = index ? `${index} — ${label}` : label;

  return (
    <div>
      <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)] sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)] max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}
