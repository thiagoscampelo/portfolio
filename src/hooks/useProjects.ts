/**
 * useProjects — Lista de projetos publicados do portfólio.
 *
 * Filtros aplicados na query:
 * - `published = true` sempre.
 * - `featured = true` quando `options.featuredOnly` for passado.
 *
 * Ordenação: campo `order` ascendente (controlado via admin).
 *
 * Também exporta `useProjectBySlug` — busca um projeto individual pelo slug
 * para a página `/projetos/:slug`.
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapProject } from "../lib/mappers";
import type { Project } from "../types";

export function useProjects(options?: { featuredOnly?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        let query = supabase
          .from("projects")
          .select("*")
          .eq("published", true)
          .order("order", { ascending: true });

        if (options?.featuredOnly) {
          query = query.eq("featured", true);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          setProjects(data.map(mapProject));
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar projetos.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [options?.featuredOnly]);

  return { projects, loading, error };
}

/**
 * useProjectBySlug — Projeto individual a partir do slug.
 *
 * Retorna `null` + mensagem de erro quando o slug não existe ou o
 * projeto está despublicado. A página `/projetos/:slug` trata esse
 * caso com um estado "não encontrado".
 *
 * Guarda `slug` numa const local antes do `async` para preservar o
 * narrowing do TypeScript dentro da closure.
 */
export function useProjectBySlug(slug: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const currentSlug = slug;

    async function fetchProject() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("slug", currentSlug)
          .eq("published", true)
          .single();

        if (error) throw error;

        if (data) {
          setProject(mapProject(data));
        }
      } catch (err: any) {
        setError(err.message || "Projeto não encontrado.");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [slug]);

  return { project, loading, error };
}
