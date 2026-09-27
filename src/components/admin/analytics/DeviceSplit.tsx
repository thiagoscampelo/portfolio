/**
 * DeviceSplit — Distribuição percentual por tipo de dispositivo.
 *
 * Recebe os valores brutos do RPC e calcula as porcentagens internamente.
 * Cada linha é uma barra horizontal com a fração correspondente.
 */
import { Smartphone, Tablet, Monitor, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AnalyticsDeviceSplit } from "../../../hooks/useAnalytics";

interface DeviceSplitProps {
  data: AnalyticsDeviceSplit[];
  loading?: boolean;
}

// Mapeia as strings que o hook de tracking envia para ícones/labels.
const DEVICE_META: Record<
  string,
  { label: string; icon: LucideIcon; color: string }
> = {
  mobile: { label: "Mobile", icon: Smartphone, color: "#818cf8" },
  tablet: { label: "Tablet", icon: Tablet, color: "#a78bfa" },
  desktop: { label: "Desktop", icon: Monitor, color: "#6366f1" },
  unknown: { label: "Outro", icon: HelpCircle, color: "#64748b" },
};

export default function DeviceSplit({
  data,
  loading = false,
}: DeviceSplitProps) {
  const total = data.reduce((sum, d) => sum + Number(d.views), 0);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] mb-4">
        Dispositivos
      </h3>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 bg-[var(--color-border)]/40 rounded animate-pulse"
            />
          ))}
        </div>
      ) : data.length === 0 || total === 0 ? (
        <p className="text-sm text-[var(--color-muted)] py-4">
          Sem dados no período.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((entry) => {
            const meta = DEVICE_META[entry.device] ?? DEVICE_META.unknown;
            const Icon = meta.icon;
            const pct = (Number(entry.views) / total) * 100;

            return (
              <li key={entry.device}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-[var(--color-foreground)]">
                    <Icon size={14} className="text-[var(--color-muted)]" />
                    {meta.label}
                  </span>
                  <span className="text-xs text-[var(--color-muted)] font-mono">
                    {pct.toFixed(0)}% ·{" "}
                    {Number(entry.views).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
