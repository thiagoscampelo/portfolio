/**
 * PageLoading — Spinner de carregamento de página (dentro do layout).
 *
 * Uso:
 * - Fallback do `<Suspense>` no `PublicLayout` enquanto um chunk lazy
 *   de página está sendo baixado.
 *
 * Diferença de `AppLoading`:
 * - `PageLoading` — ocupa ~40vh, fica dentro do layout (Header + Footer
 *   permanecem visíveis). Usado ao trocar de rota.
 * - `AppLoading` — tela cheia, cobre tudo. Usado no boot inicial do app
 *   e no carregamento do `AdminApp`/`PublicApp`.
 *
 * Acessibilidade:
 * - `role="status"` + `aria-label` para leitores de tela.
 */
export default function PageLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div
        aria-label="Carregando"
        role="status"
        className="h-6 w-6 rounded-full border-2 border-[var(--color-border)] border-t-indigo-500 animate-spin"
      />
    </div>
  );
}
