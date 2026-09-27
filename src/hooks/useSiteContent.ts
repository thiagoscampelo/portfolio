/**
 * useSiteContent — Textos editáveis das páginas (tabela key/value).
 *
 * Retorna um mapa `{ chave: valor }` com todos os textos cadastrados em
 * `site_content`. Componentes consomem como:
 *
 *   content.home_projects_title || "Projetos selecionados."
 *
 * O fallback em JSX é intencional: garante que a página renderize mesmo
 * que a chave não exista no banco ou o fetch falhe.
 *
 * Usa `dedupe()` porque o hook é chamado por múltiplas seções (Header,
 * Hero, Footer, etc). Sem isso, cada seção dispararia o próprio request.
 */
import { useEffect, useState } from "react";
import { dedupe } from "../lib/fetchCache";
import { supabase } from "../lib/supabase";

type ContentMap = Record<string, string>;

export function useSiteContent() {
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchContent() {
      try {
        setLoading(true);

        const { data, error } = await dedupe("site_content:all", () =>
          supabase.from("site_content").select("key, value"),
        );

        if (error) throw error;

        if (mounted && data) {
          const map: ContentMap = {};
          for (const row of data) {
            map[row.key] = row.value ?? "";
          }
          setContent(map);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Erro ao carregar textos.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchContent();
    return () => {
      mounted = false;
    };
  }, []);

  return { content, loading, error };
}
