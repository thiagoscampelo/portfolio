/**
 * supabase — Cliente Supabase tipado.
 *
 * O tipo genérico `Database` vem de `database.types.ts`, gerado pelo
 * Supabase CLI (`supabase gen types typescript`). Isso dá autocomplete
 * completo em `.from("projects").select("*")` e valida nomes de tabela,
 * coluna e payload de insert/update em tempo de compilação.
 *
 * Variáveis de ambiente (definidas em `.env.local`):
 * - `VITE_SUPABASE_URL`       — URL do projeto.
 * - `VITE_SUPABASE_ANON_KEY`  — chave anônima (pública, protegida por RLS).
 *
 * Nota de segurança:
 * - A chave anônima **é pública por design** — ela vai embutida no bundle.
 *   A autorização real é feita pelas policies de RLS no servidor.
 * - Nunca importar `SERVICE_ROLE_KEY` aqui. Ela bypassa RLS e é só para
 *   contextos server-side confiáveis.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variáveis de ambiente do Supabase não foram configuradas.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
