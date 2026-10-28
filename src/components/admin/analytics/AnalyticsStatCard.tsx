/**
 * AnalyticsStatCard — Card de métrica individual do topo do dashboard.
 *
 * Exibe um valor principal, um delta percentual (opcional) em relação
 * ao período anterior, e um contexto secundário (ex: total de sempre).
 *
 * Layout:
 * - Rótulo monoespaçado com ícone discreto (sem tile colorido).
 * - Número grande em mono + `tabular-nums` para alinhamento entre cards.
 * - Delta como chip quadrado à direita.
 *
 * Estados do delta:
 * - `delta > 1%`   → seta ↑ verde
 * - `delta < -1%`  → seta ↓ vermelha
 * - `-1% ≤ x ≤ 1%` → traço neutro
 * - `null`         → sem base de comparação (período anterior = 0)
 */
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AnalyticsStatCardProps {
  label: string;
  value: number;
  delta?: number | null;
  secondaryLabel?: string;
  secondaryValue?: number;
  icon: LucideIcon;
  loading?: boolean;
}

export default function AnalyticsStatCard({
  label,
  value,
  delta,
  secondaryLabel,
  secondaryValue,
  icon: Icon,
  loading = false,
}: AnalyticsStatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[var(--color-muted)]">
          <Icon size={13} className="shrink-0" />
          <span>{label}</span>
        </p>
        {!loading && delta !== undefined && <DeltaBadge delta={delta} />}
      </div>

      {loading ? (
        <div className="mt-4 h-8 w-20 animate-pulse rounded bg-[var(--color-border)]/40" />
      ) : (
        <>
          <p className="mt-4 font-mono text-[1.9rem] leading-none tracking-[-0.03em] tabular-nums text-[var(--color-foreground)]">
            {value.toLocaleString("pt-BR")}
          </p>

          {secondaryLabel !== undefined && secondaryValue !== undefined && (
            <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]/80">
              {secondaryValue.toLocaleString("pt-BR")} {secondaryLabel}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────── Subcomponente ─────────── */

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-muted)]"
        title="Sem base de comparação no período anterior"
      >
        <Minus size={9} /> novo
      </span>
    );
  }

  const isUp = delta > 1;
  const isDown = delta < -1;

  if (!isUp && !isDown) {
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-muted)]"
        title="Variação insignificante em relação ao período anterior"
      >
        <Minus size={9} /> 0%
      </span>
    );
  }

  const Icon = isUp ? ArrowUp : ArrowDown;
  const colorClass = isUp ? "text-brand" : "text-red-400";
  const bgClass = isUp ? "bg-brand/10" : "bg-red-500/10";
  const borderClass = isUp ? "border-brand/20" : "border-red-500/20";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-[0.12em] ${colorClass} ${bgClass} ${borderClass}`}
      title={`${isUp ? "Aumento" : "Queda"} de ${Math.abs(delta).toFixed(1)}% em relação ao período anterior`}
    >
      <Icon size={9} />
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}
