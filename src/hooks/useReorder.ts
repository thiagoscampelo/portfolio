/**
 * useReorder — Reordenação de listas via setas ↑↓ no admin.
 *
 * Como funciona:
 * 1. Faz swap dos itens em memória (índice `i` com `i-1` ou `i+1`).
 * 2. Reindexação completa: envia `order = 0, 1, 2, ...` para TODAS as
 *    linhas da tabela em paralelo.
 *
 * Por que reindexar tudo em vez de trocar apenas os dois `order`:
 * os itens nascem com `order = 0` (default do banco). Trocar `0` com
 * `0` não muda nada. A reindexação normaliza e depois cada clique só
 * precisa refazer essa normalização, sem estado sujo.
 *
 * Notas de tipo:
 * - `table` é restrito ao union `ReorderTable` — a tipagem do Supabase
 *   só aceita nomes conhecidos de tabela.
 * - O cast `{ order: i } as never` contorna a inferência do PostgREST,
 *   que tenta validar o payload contra o tipo `Update` de todas as
 *   tabelas do union. Na prática é sempre `{ order: number }`, válido
 *   em todas elas.
 */
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./useToast";

type Direction = "up" | "down";

type ReorderTable =
  | "projects"
  | "experiences"
  | "skills"
  | "education"
  | "social_links"
  | "collaborations";

interface OrderableItem {
  id: string;
  order: number;
}

export function useReorder<T extends OrderableItem>(
  table: ReorderTable,
  onComplete: () => void | Promise<void>,
) {
  const { error: toastError } = useToast();
  const [reordering, setReordering] = useState(false);

  async function reorder(items: T[], index: number, direction: Direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setReordering(true);
    try {
      // 1. Swap em memória
      const next = [...items];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      // 2. Reindexação completa — `order = 0, 1, 2, ...`
      const updates = next.map((item, i) =>
        supabase
          .from(table)
          .update({ order: i } as never)
          .eq("id", item.id),
      );

      const results = await Promise.all(updates);
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;

      await onComplete();
    } catch (err: any) {
      toastError("Erro ao reordenar: " + (err.message || "desconhecido"));
    } finally {
      setReordering(false);
    }
  }

  return { reordering, reorder };
}
