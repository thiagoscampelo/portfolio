/**
 * TopList — Lista ranqueada genérica (top pages, top referrers, etc).
 *
 * Usado em duas instâncias no dashboard:
 * - Páginas mais visitadas (path amigável + tooltip com path original)
 * - Origens de tráfego (source amigável + tag com o tipo de medium)
 *
 * Cada linha mostra:
 *   rank · label · [tag] · valor · [· secundário]
 *
 * O campo `tag` é um badge pequeno à direita do label (ex: "Busca",
 * "Social"), usado para classificar visualmente o tipo de referrer.
 */
interface TopListItem {
  label: string;
  value: number;
  secondary?: number;
  /** Texto do `title` nativo (hover). Fallback para o próprio label. */
  tooltip?: string;
  /** Badge opcional à direita (ex: "Busca", "Social"). */
  tag?: string;
}

interface TopListProps {
  title: string;
  emptyMessage: string;
  items: TopListItem[];
  loading?: boolean;
}

export default function TopList({
  title,
  emptyMessage,
  items,
  loading = false,
}: TopListProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] mb-4">
        {title}
      </h3>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-[var(--color-border)]/40 rounded animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] py-4">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item, index) => (
            <li
              key={item.label + index}
              className="flex items-center gap-3 py-2 border-b border-[var(--color-border)]/40 last:border-b-0"
            >
              <span className="w-5 shrink-0 text-[10px] font-mono text-[var(--color-muted)]/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className="flex-1 min-w-0 text-xs text-[var(--color-foreground)] truncate"
                title={item.tooltip ?? item.label}
              >
                {item.label}
              </span>
              {item.tag && (
                <span className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-background)]/60 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
                  {item.tag}
                </span>
              )}
              <span className="shrink-0 text-xs font-medium text-[var(--color-foreground)]">
                {item.value.toLocaleString("pt-BR")}
              </span>
              {item.secondary !== undefined && (
                <span className="shrink-0 text-[10px] text-[var(--color-muted)] font-mono">
                  · {item.secondary.toLocaleString("pt-BR")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
