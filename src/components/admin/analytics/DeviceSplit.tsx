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
  mobile: { label: "Mobile", icon: Smartphone, color: "#38bf6b" },
  tablet: { label: "Tablet", icon: Tablet, color: "#58d6a4" },
  desktop: { label: "Desktop", icon: Monitor, color: "#a7b2ad" },
  unknown: { label: "Outro", icon: HelpCircle, color: "#64748b" },
};

export default function DeviceSplit({
  data,
  loading = false,
}: DeviceSplitProps) {
  const total = data.reduce((sum, d) => sum + Number(d.views), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <h3 className="border-b border-[var(--color-border)] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
        Dispositivos
      </h3>

      {loading ? (
        <div className="flex flex-col gap-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 animate-pulse rounded bg-[var(--color-border)]/40"
            />
          ))}
        </div>
      ) : data.length === 0 || total === 0 ? (
        <p className="p-5 text-sm text-[var(--color-muted)]">
          Sem dados no período.
        </p>
      ) : (
        <ul className="flex flex-col gap-4 p-5">
          {data.map((entry) => {
            const meta = DEVICE_META[entry.device] ?? DEVICE_META.unknown;
            const Icon = meta.icon;
            const pct = (Number(entry.views) / total) * 100;

            return (
              <li key={entry.device}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-[var(--color-foreground)]">
                    <Icon size={13} className="text-[var(--color-muted)]" />
                    {meta.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] tabular-nums text-[var(--color-muted)]">
                    {pct.toFixed(0)}% ·{" "}
                    {Number(entry.views).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-border)]">
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
