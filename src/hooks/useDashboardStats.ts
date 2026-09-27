/**
 * useDashboardStats — Contadores por tabela para o Dashboard do admin.
 *
 * Para cada uma das 6 tabelas principais, retorna:
 * - `total`     — quantidade de linhas (independe de `published`).
 * - `published` — quantidade com `published = true`.
 *
 * Estratégia: as 12 queries (6 tabelas × 2 contagens) são disparadas em
 * paralelo. Cada uma usa `head: true` — o PostgREST retorna apenas o
 * count, sem payload de linhas. É muito mais rápido que `select("*")`
 * e contar no client.
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type StatTable =
  | "projects"
  | "experiences"
  | "skills"
  | "education"
  | "social_links"
  | "collaborations";

interface StatItem {
  total: number;
  published: number;
}

interface DashboardStats {
  projects: StatItem;
  experiences: StatItem;
  skills: StatItem;
  education: StatItem;
  socialLinks: StatItem;
  collaborations: StatItem;
}

const EMPTY: StatItem = { total: 0, published: 0 };

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    projects: EMPTY,
    experiences: EMPTY,
    skills: EMPTY,
    education: EMPTY,
    socialLinks: EMPTY,
    collaborations: EMPTY,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCount(table: StatTable): Promise<StatItem> {
      const [totalRes, publishedRes] = await Promise.all([
        supabase.from(table).select("*", { count: "exact", head: true }),
        supabase
          .from(table)
          .select("*", { count: "exact", head: true })
          .eq("published", true),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (publishedRes.error) throw publishedRes.error;

      return {
        total: totalRes.count ?? 0,
        published: publishedRes.count ?? 0,
      };
    }

    async function fetchAll() {
      try {
        setLoading(true);

        const [
          projects,
          experiences,
          skills,
          education,
          socialLinks,
          collaborations,
        ] = await Promise.all([
          fetchCount("projects"),
          fetchCount("experiences"),
          fetchCount("skills"),
          fetchCount("education"),
          fetchCount("social_links"),
          fetchCount("collaborations"),
        ]);

        if (mounted) {
          setStats({
            projects,
            experiences,
            skills,
            education,
            socialLinks,
            collaborations,
          });
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Erro ao carregar estatísticas.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading, error };
}
