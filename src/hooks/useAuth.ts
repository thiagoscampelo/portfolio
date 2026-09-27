/**
 * useAuth — Sessão atual do Supabase Auth.
 *
 * Responsabilidade:
 * - Recupera a sessão existente via `auth.getSession()` na montagem.
 * - Assina `onAuthStateChange` para reagir a login/logout em tempo real.
 * - Cancela a assinatura e evita `setState` órfão na desmontagem.
 *
 * Retorno:
 * - `session`  — `Session | null`. `null` quando não logado.
 * - `loading`  — `true` enquanto a leitura inicial não resolve.
 *
 * Usado por `AdminGuard` para decidir entre renderizar o painel ou
 * redirecionar para `/login`.
 */
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}