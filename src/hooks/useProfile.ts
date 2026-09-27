/**
 * useProfile — Dados do profissional (linha única em `profiles`).
 *
 * Comportamento:
 * - Usa `dedupe()` para compartilhar a requisição quando múltiplos
 *   componentes chamam o hook ao mesmo tempo (Header + Footer + Hero,
 *   por exemplo). Sem isso, cada um dispararia o próprio request.
 * - Impõe um tempo mínimo de 350ms para o estado `loading`, evitando
 *   flicker quando a resposta do Supabase chega rápido.
 * - `refetch()` é exposto para revalidar após um `update` no admin.
 *
 * Retorno:
 * - `profile`  — `Profile | null` (null quando ainda não carregou).
 * - `loading`  — estado de carregamento com delay mínimo.
 * - `error`    — mensagem de erro, quando aplicável.
 * - `refetch`  — função para forçar nova busca.
 */
import { useEffect, useState } from "react";
import { mapProfile } from "../lib/mappers";
import { dedupe } from "../lib/fetchCache";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      setLoading(true);
      const startTime = Date.now();

      const { data, error } = await dedupe("profile:single", () =>
        supabase.from("profiles").select("*").limit(1).maybeSingle(),
      );

      if (error) throw error;

      // Garante um mínimo de 350ms no estado de loading para evitar
      // flicker em respostas instantâneas.
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 350;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime),
        );
      }

      if (data) {
        setProfile(mapProfile(data));
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}
