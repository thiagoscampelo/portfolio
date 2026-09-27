/**
 * AnalyticsStatCard — Card de métrica individual do topo do dashboard.
 *
 * Exibe um valor principal, um delta percentual (opcional) em relação
 * ao período anterior, e um contexto secundário (ex: total de sempre).
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
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Icon size={16} />
        </div>
        {!loading && delta !== undefined && <DeltaBadge delta={delta} />}
      </div>

      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-muted)]">
        {label}
      </p>

      {loading ? (
        <div className="mt-2 h-8 w-20 bg-[var(--color-border)]/40 rounded animate-pulse" />
      ) : (
        <>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)] leading-none">
            {value.toLocaleString("pt-BR")}
          </p>

          {secondaryLabel !== undefined && secondaryValue !== undefined && (
            <p className="mt-2 text-xs text-[var(--color-muted)]">
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
        className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]/60"
        title="Sem base de comparação no período anterior"
      >
        <Minus size={10} /> novo
      </span>
    );
  }

  const isUp = delta > 1;
  const isDown = delta < -1;

  if (!isUp && !isDown) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]/60"
        title="Variação insignificante em relação ao período anterior"
      >
        <Minus size={10} /> 0%
      </span>
    );
  }

  const Icon = isUp ? ArrowUp : ArrowDown;
  const colorClass = isUp ? "text-emerald-400" : "text-red-400";
  const bgClass = isUp ? "bg-emerald-500/10" : "bg-red-500/10";
  const borderClass = isUp ? "border-emerald-500/20" : "border-red-500/20";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-mono font-medium ${colorClass} ${bgClass} ${borderClass}`}
      title={`${
        isUp ? "Aumento" : "Queda"
      } de ${Math.abs(delta).toFixed(1)}% em relação ao período anterior`}
    >
      <Icon size={10} />
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}
