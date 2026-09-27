/**
 * Skeleton — Placeholder de carregamento.
 *
 * Um retângulo com `animate-pulse` do Tailwind, usado enquanto dados
 * assíncronos não chegam. As dimensões são controladas via `className`
 * (`h-4 w-32`, `aspect-[16/10] rounded-2xl`, etc).
 *
 * Uso típico:
 *   {loading ? <Skeleton className="h-4 w-32" /> : <p>{data}</p>}
 *
 * Por que skeleton e não spinner:
 * - Skeleton preserva a estrutura visual enquanto carrega, reduzindo
 *   "layout shift" quando o conteúdo chega.
 * - Já usamos spinner em `AppLoading` e `PageLoading` — esses são para
 *   transições de rota (curtas), skeleton é para carregamento de dados.
 */
interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-border)]/40 rounded ${className}`}
    />
  );
}
