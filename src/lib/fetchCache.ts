/**
 * Deduplica requisições em-flight.
 *
 * Se múltiplos componentes chamam a mesma key ao mesmo tempo (ex: 3 chamadas
 * a `useProfile()` em Header, Hero e Footer), só a primeira requisição é
 * disparada. As demais recebem a mesma promise.
 *
 * Depois que a promise resolve (ou rejeita), o cache é liberado — a próxima
 * chamada dispara uma requisição nova. Não há staleness.
 *
 * Aceita PromiseLike (não só Promise) para acomodar o PostgrestBuilder do
 * Supabase, que é thenable mas não implementa a interface Promise completa.
 */
const pending: Record<string, Promise<unknown> | null> = {};

export function dedupe<T>(key: string, fn: () => PromiseLike<T>): Promise<T> {
  const inFlight = pending[key];
  if (inFlight) return inFlight as Promise<T>;

  const promise = Promise.resolve(fn()).finally(() => {
    pending[key] = null;
  });

  pending[key] = promise;
  return promise;
}
