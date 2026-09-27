/**
 * useSocialLinks — Links sociais publicados.
 *
 * As URLs passam por `normalizeSocialUrl` no mapper, garantindo formato
 * consistente (WhatsApp → wa.me, Telegram → t.me, etc).
 *
 * Consumido em:
 * - Footer (ícones)
 * - `/contato` (cards com rótulo e seta)
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapSocialLink } from "../lib/mappers";
import type { SocialLink } from "../types";

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("social_links")
          .select("*")
          .eq("published", true)
          .order("order", { ascending: true });

        if (error) throw error;
        if (data) setLinks(data.map(mapSocialLink));
      } catch (err: any) {
        setError(err.message || "Erro ao carregar links sociais.");
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  return { links, loading, error };
}
