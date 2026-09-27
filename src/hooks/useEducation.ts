/**
 * useEducation — Formação acadêmica publicada.
 *
 * Ordenação: campo `order` ascendente.
 * Usado em `/sobre` (seção 03 — Formação).
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapEducation } from "../lib/mappers";
import type { Education } from "../types";

export function useEducation() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEducation() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("education")
          .select("*")
          .eq("published", true)
          .order("order", { ascending: true });

        if (error) throw error;
        if (data) setEducation(data.map(mapEducation));
      } catch (err: any) {
        setError(err.message || "Erro ao carregar formação acadêmica.");
      } finally {
        setLoading(false);
      }
    }
    fetchEducation();
  }, []);

  return { education, loading, error };
}
