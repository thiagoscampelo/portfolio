/**
 * useSkills — Habilidades técnicas publicadas.
 *
 * Ordenação: campo `order` ascendente.
 * Usado em `/sobre` (seção 04 — Ferramentas) e nos formulários do admin.
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapSkill } from "../lib/mappers";
import type { Skill } from "../types";

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSkills() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("published", true)
        .order("order", { ascending: true });

      if (error) throw error;

      if (data) {
        setSkills(data.map(mapSkill));
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar habilidades.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSkills();
  }, []);

  return { skills, loading, error, refetch: fetchSkills };
}
