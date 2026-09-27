/**
 * useAnalytics — Busca estatísticas agregadas de page views para o dashboard.
 *
 * Estratégia:
 * - Uma única chamada paralela (Promise.all) para as 6 RPCs.
 * - Reexecuta quando `periodDays` muda.
 * - Separa `loading` (primeira carga) de `refreshing` (troca de período)
 *   para que a UI possa mostrar skeleton só uma vez, e um spinner leve depois.
 * - Refetch ao voltar o foco para a aba, evitando dados desatualizados
 *   quando o dashboard fica aberto em segundo plano.
 *
 * Segurança:
 * - As RPCs não usam SECURITY DEFINER. A RLS em `page_views` restringe
 *   SELECT a admins, então visitantes e usuários não-admin recebem zero linhas
 *   mesmo chamando as funções diretamente.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

/* ═══════════ Tipos derivados das RPCs ═══════════ */

type Fns = Database["public"]["Functions"];

export type AnalyticsOverview = Fns["analytics_overview"]["Returns"][number];
export type AnalyticsTopPage = Fns["analytics_top_pages"]["Returns"][number];
export type AnalyticsTopReferrer =
  Fns["analytics_top_referrers"]["Returns"][number];
export type AnalyticsDailyView =
  Fns["analytics_daily_views"]["Returns"][number];
export type AnalyticsDeviceSplit =
  Fns["analytics_device_split"]["Returns"][number];
export type AnalyticsCompare = Fns["analytics_compare"]["Returns"][number];

/* ═══════════ Shapes de retorno ═══════════ */

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  compare: AnalyticsCompare | null;
  topPages: AnalyticsTopPage[];
  topReferrers: AnalyticsTopReferrer[];
  dailyViews: AnalyticsDailyView[];
  deviceSplit: AnalyticsDeviceSplit[];
}

const EMPTY_STATE: AnalyticsState = {
  overview: null,
  compare: null,
  topPages: [],
  topReferrers: [],
  dailyViews: [],
  deviceSplit: [],
};

/* ═══════════ Hook ═══════════ */

export function useAnalytics(periodDays: number = 30) {
  const [data, setData] = useState<AnalyticsState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        // As 6 chamadas são independentes — disparam em paralelo.
        const [
          overviewRes,
          compareRes,
          topPagesRes,
          topReferrersRes,
          dailyViewsRes,
          deviceSplitRes,
        ] = await Promise.all([
          supabase.rpc("analytics_overview", { p_days: periodDays }),
          supabase.rpc("analytics_compare", { p_days: periodDays }),
          supabase.rpc("analytics_top_pages", {
            p_days: periodDays,
            p_limit: 10,
          }),
          supabase.rpc("analytics_top_referrers", {
            p_days: periodDays,
            p_limit: 50,
          }),
          supabase.rpc("analytics_daily_views", { p_days: periodDays }),
          supabase.rpc("analytics_device_split", { p_days: periodDays }),
        ]);

        const firstError =
          overviewRes.error ||
          compareRes.error ||
          topPagesRes.error ||
          topReferrersRes.error ||
          dailyViewsRes.error ||
          deviceSplitRes.error;
        if (firstError) throw firstError;

        setData({
          overview: overviewRes.data?.[0] ?? null,
          compare: compareRes.data?.[0] ?? null,
          topPages: topPagesRes.data ?? [],
          topReferrers: topReferrersRes.data ?? [],
          dailyViews: dailyViewsRes.data ?? [],
          deviceSplit: deviceSplitRes.data ?? [],
        });
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados de analytics.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [periodDays],
  );

  // Carga inicial e re-carga quando `periodDays` muda.
  useEffect(() => {
    void fetchAll(false);
  }, [fetchAll]);

  // Refetch ao voltar o foco para a aba.
  // Usa `refreshing` (não `loading`) para não piscar o layout inteiro.
  useEffect(() => {
    function handleFocus() {
      void fetchAll(true);
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchAll]);

  // `refetch` mantém o `loading` atual intocado — só ativa `refreshing`.
  // Útil para botões de atualizar sem causar flicker no layout.
  const refetch = useCallback(() => fetchAll(true), [fetchAll]);

  return {
    ...data,
    loading,
    refreshing,
    error,
    refetch,
  };
}

/* ═══════════ Utilitário ═══════════ */

/**
 * Calcula variação percentual entre dois valores.
 * Retorna `null` quando não é possível calcular (base = 0).
 */
export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}
