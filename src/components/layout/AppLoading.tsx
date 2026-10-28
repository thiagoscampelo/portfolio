/**
 * AppLoading — Spinner de tela cheia para o carregamento inicial do app.
 *
 * Uso:
 * - Fallback do `<Suspense>` no `App.tsx` (boot do app).
 * - Fallback do `<Suspense>` no `AdminApp` / `PublicApp` quando o chunk
 *   principal ainda não chegou.
 *
 * Diferença de `PageLoading`:
 * - `AppLoading` — ocupa 100vh, fundo opaco. Cobre tudo.
 * - `PageLoading` — ~40vh, dentro do layout.
 *
 * Acessibilidade:
 * - `role="status"` + `aria-label` para leitores de tela.
 * - Texto "Carregando" em mono uppercase — reforça o tom técnico.
 */
export default function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <div
          aria-label="Carregando"
          role="status"
          className="h-8 w-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin"
        />
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-muted)]">
          Carregando
        </span>
      </div>
    </div>
  );
}
