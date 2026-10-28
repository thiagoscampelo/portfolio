/**
 * AdminAnalytics — Dashboard de estatísticas de page views.
 *
 * Estrutura:
 * 1. Header com título + filtro de período + botão export + refresh.
 * 2. Grid de 4 cards de métrica com delta vs período anterior.
 * 3. Gráfico de barras com views diárias.
 * 4. Grid 2 colunas: top pages | top referrers.
 * 5. Distribuição por dispositivo.
 *
 * Data source: hook useAnalytics (RPCs Postgres agregadas).
 *
 * Pós-processamento de dados:
 * - **Referrers**: cada hostname do RPC é classificado por
 *   `classifyReferrer` (Google/Busca, LinkedIn/Social, etc) e agregado
 *   por source. Uma linha "Direto" é prependada quando há tráfego sem
 *   referrer (calculado como `period_views - soma dos externos`).
 * - **Pages**: cada path é convertido em nome amigável via
 *   `describePath` ("/" → "Home", "/sobre" → "Sobre").
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Eye,
  Users,
  Calendar,
  RefreshCw,
  Activity,
  Download,
} from "lucide-react";
import { useAnalytics, percentDelta } from "../../../hooks/useAnalytics";
import PeriodFilter from "../../../components/admin/analytics/PeriodFilter";
import AnalyticsStatCard from "../../../components/admin/analytics/AnalyticsStatCard";
import ViewsChart from "../../../components/admin/analytics/ViewsChart";
import TopList from "../../../components/admin/analytics/TopList";
import DeviceSplit from "../../../components/admin/analytics/DeviceSplit";
import { downloadCsv } from "../../../lib/exportCsv";
import { aggregateReferrers } from "../../../lib/referrerClassifier";
import { describePath } from "../../../lib/pageLabels";

/* ─────────── Helpers ─────────── */

/**
 * Converte valor bruto de bigint | number | null para number.
 *
 * O Supabase tipa colunas `count(*)` como bigint, mas o TS trata
 * como `number` na maioria dos casos. Esse helper normaliza ambos
 * para garantir que `.toLocaleString("pt-BR")` funcione sempre.
 */
function n(value: number | bigint | undefined | null): number {
  return Number(value ?? 0);
}

/* ─────────── Página ─────────── */

export default function AdminAnalytics() {
  const [periodDays, setPeriodDays] = useState(30);
  const {
    overview,
    compare,
    topPages,
    topReferrers,
    dailyViews,
    deviceSplit,
    loading,
    refreshing,
    error,
    refetch,
  } = useAnalytics(periodDays);

  const stats = {
    periodViews: n(overview?.period_views),
    periodVisitors: n(overview?.period_visitors),
    totalViews: n(overview?.total_views),
    totalVisitors: n(overview?.total_visitors),
    todayViews: n(overview?.today_views),
    todayVisitors: n(overview?.today_visitors),
  };

  // Delta % vs período anterior — calculado a partir da RPC analytics_compare.
  const deltas = {
    views: compare
      ? percentDelta(n(compare.current_views), n(compare.previous_views))
      : null,
    visitors: compare
      ? percentDelta(n(compare.current_visitors), n(compare.previous_visitors))
      : null,
  };

  /* ─── Referrers classificados + agregados ─── */
  const aggregatedReferrers = aggregateReferrers(
    topReferrers.map((r) => ({ referrer: r.referrer, views: r.views })),
  );

  // "Direto" = total do período - soma dos referrers externos.
  // Inclui tanto acessos diretos (URL digitada) quanto navegação interna
  // (que o tracking zera o referrer). É o mesmo critério que o GA chama
  // de "Direct / None".
  const totalExternalRefs = aggregatedReferrers.reduce(
    (sum, r) => sum + r.count,
    0,
  );
  const directCount = Math.max(0, stats.periodViews - totalExternalRefs);

  const referrerItems = [
    ...(directCount > 0
      ? [
          {
            source: "Direto",
            sourceKey: "direct",
            medium: "direct" as const,
            mediumLabel: "Direto",
            count: directCount,
          },
        ]
      : []),
    ...aggregatedReferrers,
  ];

  /* ─── Export CSV ─── */
  function handleExport() {
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`analytics-${periodDays}d-${timestamp}.csv`, [
      {
        title: `Período: últimos ${periodDays} dias`,
        headers: ["Métrica", "Valor"],
        rows: [
          ["Views no período", stats.periodViews],
          ["Visitantes no período", stats.periodVisitors],
          ["Views hoje", stats.todayViews],
          ["Visitantes hoje", stats.todayVisitors],
          ["Views no total", stats.totalViews],
          ["Visitantes no total", stats.totalVisitors],
        ],
      },
      {
        title: "Views por dia",
        headers: ["Data", "Views", "Visitantes únicos"],
        rows: dailyViews.map((d) => [d.day, n(d.views), n(d.unique_visitors)]),
      },
      {
        title: "Páginas mais visitadas",
        headers: ["Rank", "Página", "Path", "Views", "Visitantes únicos"],
        rows: topPages.map((p, i) => {
          const info = describePath(p.path);
          return [i + 1, info.label, p.path, n(p.views), n(p.unique_visitors)];
        }),
      },
      {
        title: "Origem do tráfego",
        headers: ["Rank", "Origem", "Tipo", "Views"],
        rows: referrerItems.map((r, i) => [
          i + 1,
          r.source,
          r.mediumLabel,
          r.count,
        ]),
      },
      {
        title: "Dispositivos",
        headers: ["Dispositivo", "Views"],
        rows: deviceSplit.map((d) => [d.device, n(d.views)]),
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* ═══════════ HEADER ═══════════ */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--color-border)] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            <BarChart3 size={14} className="text-brand" />
            <span>Estatísticas</span>
          </div>
          <h1 className="mt-3 text-[1.75rem] font-medium tracking-[-0.035em] text-[var(--color-foreground)] sm:text-[2rem]">
            Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            Acompanhe o tráfego do portfólio — views, visitantes, origem e
            comportamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <PeriodFilter
            value={periodDays}
            onChange={setPeriodDays}
            disabled={refreshing}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            aria-label="Exportar CSV"
            title="Exportar dados em CSV"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-50"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={refreshing}
            aria-label="Atualizar dados"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

      </motion.div>

      {/* ═══════════ ERRO ═══════════ */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ═══════════ CARDS DE OVERVIEW ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard
          label="Views"
          value={stats.periodViews}
          delta={deltas.views}
          secondaryLabel="no total"
          secondaryValue={stats.totalViews}
          icon={Eye}
          loading={loading}
        />
        <AnalyticsStatCard
          label="Visitantes"
          value={stats.periodVisitors}
          delta={deltas.visitors}
          secondaryLabel="no total"
          secondaryValue={stats.totalVisitors}
          icon={Users}
          loading={loading}
        />
        <AnalyticsStatCard
          label="Views hoje"
          value={stats.todayViews}
          icon={Calendar}
          loading={loading}
        />
        <AnalyticsStatCard
          label="Visitantes hoje"
          value={stats.todayVisitors}
          icon={Activity}
          loading={loading}
        />
      </div>

      {/* ═══════════ GRÁFICO ═══════════ */}
      <motion.div
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Views por dia
            </h3>
            <p className="text-[11px] text-[var(--color-muted)]/70 mt-1">
              Últimos {periodDays} dias · passe o mouse para ver detalhes
            </p>
          </div>
          {refreshing && !loading && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1.5">
              <RefreshCw size={11} className="animate-spin" />
              Atualizando
            </span>
          )}
        </div>

        {loading ? (
          <div className="h-[240px] bg-[var(--color-border)]/30 rounded-xl animate-pulse" />
        ) : (
          <ViewsChart data={dailyViews} />
        )}
      </motion.div>

      {/* ═══════════ TOP PAGES + REFERRERS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopList
          title="Páginas mais visitadas"
          emptyMessage="Sem visitas no período."
          loading={loading}
          items={topPages.map((page) => {
            const info = describePath(page.path);
            return {
              label: info.label,
              tooltip: info.path,
              value: n(page.views),
              secondary: n(page.unique_visitors),
            };
          })}
        />
        <TopList
          title="Origem do tráfego"
          emptyMessage="Nenhuma origem externa registrada."
          loading={loading}
          items={referrerItems.map((r) => ({
            label: r.source,
            tooltip: r.source,
            value: r.count,
            tag: r.medium !== "direct" ? r.mediumLabel : undefined,
          }))}
        />
      </div>

      {/* ═══════════ DEVICE SPLIT ═══════════ */}
      <DeviceSplit data={deviceSplit} loading={loading} />
    </div>
  );
}
