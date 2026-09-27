/**
 * useExperiences — Histórico profissional (experiências publicadas).
 *
 * Ordenação: campo `order` ascendente.
 * `refetch()` é usado após operações de reordenação no admin.
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapExperience } from "../lib/mappers";
import type { Experience } from "../types";

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchExperiences() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("published", true)
        .order("order", { ascending: true });

      if (error) throw error;

      if (data) {
        setExperiences(data.map(mapExperience));
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar experiências.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExperiences();
  }, []);

  return { experiences, loading, error, refetch: fetchExperiences };
}
