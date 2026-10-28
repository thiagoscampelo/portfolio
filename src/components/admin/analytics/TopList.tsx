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
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <h3 className="border-b border-[var(--color-border)] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
        {title}
      </h3>

      {loading ? (
        <div className="flex flex-col gap-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-[var(--color-border)]/40"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="p-5 text-sm text-[var(--color-muted)]">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col px-5 py-2">
          {items.map((item, index) => (
            <li
              key={item.label + index}
              className="flex items-center gap-3 border-b border-[var(--color-border)] py-2.5 last:border-b-0"
            >
              <span className="w-5 shrink-0 font-mono text-[10px] text-[var(--color-muted)]/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-xs text-[var(--color-foreground)]"
                title={item.tooltip ?? item.label}
              >
                {item.label}
              </span>
              {item.tag && (
                <span className="shrink-0 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  {item.tag}
                </span>
              )}
              <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--color-foreground)]">
                {item.value.toLocaleString("pt-BR")}
              </span>
              {item.secondary !== undefined && (
                <span className="shrink-0 font-mono text-[10px] text-[var(--color-muted)]">
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
