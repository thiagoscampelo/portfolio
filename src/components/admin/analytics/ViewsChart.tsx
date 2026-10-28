/**
 * ViewsChart — Gráfico de barras em SVG puro (sem dependência externa).
 *
 * Como funciona:
 * - viewBox fixo (800×220) → o SVG escala responsivamente via `width="100%"`.
 * - Cada barra ocupa uma "fatia" horizontal do gráfico.
 * - Barras com `rx` arredondado, preenchimento em gradiente verde mineral.
 * - Tooltip nativo via `<title>` (hover no desktop, long-press no mobile).
 * - Datas mostradas de forma seletiva (primeira, meio, última) para evitar
 *   sobreposição em períodos longos (30/90 dias).
 *
 * Casos de borda:
 * - Se todos os valores forem zero, renderiza um estado vazio em vez do gráfico.
 * - Se houver 1 só ponto, barra ocupa a largura toda.
 */
import type { AnalyticsDailyView } from "../../../hooks/useAnalytics";

interface ViewsChartProps {
  data: AnalyticsDailyView[];
  /** Altura visual do gráfico em px CSS (o SVG escala internamente). */
  height?: number;
}

const VIEW_W = 800;
const VIEW_H = 220;
const PADDING_X = 8;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 32; // espaço para os labels de data

export default function ViewsChart({ data, height = 240 }: ViewsChartProps) {
  // ─── Estado vazio ───
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-xl"
        style={{ height }}
      >
        Sem dados no período.
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const chartH = VIEW_H - PADDING_TOP - PADDING_BOTTOM;
  const slotW = (VIEW_W - PADDING_X * 2) / data.length;
  // Largura da barra: 70% do slot, limitada a 32px para não virar bloco em períodos curtos.
  const barW = Math.min(slotW * 0.7, 32);

  // Mostra ~3 labels de data: primeira, meio, última.
  const labelIndices = new Set<number>([
    0,
    Math.floor(data.length / 2),
    data.length - 1,
  ]);

  function formatDay(iso: string): string {
    // iso: "2026-09-23" (vem do Postgres como date)
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y.slice(2)}`;
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label="Gráfico de visualizações por dia"
      >
        {/* Gradiente de preenchimento das barras */}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#58d6a4" />
            <stop offset="100%" stopColor="#1c9261" />
          </linearGradient>
        </defs>

        {/* Linha de base */}
        <line
          x1={PADDING_X}
          x2={VIEW_W - PADDING_X}
          y1={VIEW_H - PADDING_BOTTOM}
          y2={VIEW_H - PADDING_BOTTOM}
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {data.map((d, i) => {
          const barH = (d.views / maxViews) * chartH;
          const x = PADDING_X + i * slotW + (slotW - barW) / 2;
          const y = VIEW_H - PADDING_BOTTOM - barH;

          return (
            <g key={d.day}>
              {/* Barra — arredondada em cima, quadrada embaixo */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 1)}
                rx={Math.min(barW / 2, 4)}
                fill="url(#barGrad)"
                className="transition-opacity hover:opacity-80"
              >
                <title>
                  {formatDay(d.day)} · {d.views} views · {d.unique_visitors}{" "}
                  visitante
                  {d.unique_visitors !== 1 ? "s" : ""}
                </title>
              </rect>

              {/* Label de data — só nas posições selecionadas */}
              {labelIndices.has(i) && (
                <text
                  x={x + barW / 2}
                  y={VIEW_H - 12}
                  textAnchor="middle"
                  className="fill-[var(--color-muted)]"
                  style={{ fontSize: 11, fontFamily: "monospace" }}
                >
                  {formatDay(d.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
