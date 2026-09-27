/**
 * useCollaborations — Tipos de colaboração publicados.
 *
 * Ordenação: campo `order` ascendente.
 * Usado em `/contato` (seção 02 — Colaborações).
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapCollaboration } from "../lib/mappers";
import type { Collaboration } from "../types";

export function useCollaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollaborations() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("collaborations")
          .select("*")
          .eq("published", true)
          .order("order", { ascending: true });

        if (error) throw error;
        if (data) setCollaborations(data.map(mapCollaboration));
      } catch (err: any) {
        setError(err.message || "Erro ao carregar colaborações.");
      } finally {
        setLoading(false);
      }
    }
    fetchCollaborations();
  }, []);

  return { collaborations, loading, error };
}
