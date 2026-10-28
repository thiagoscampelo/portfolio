/**
 * ReorderButtons — Par de botões ↑↓ para reordenar itens em listas do admin.
 *
 * Comportamento:
 * - `↑` move o item uma posição para cima (troca com o anterior).
 * - `↓` move o item uma posição para baixo (troca com o próximo).
 * - Ambos ficam desabilitados quando a ação não faz sentido:
 *   - `↑` no primeiro item (`canMoveUp = false`)
 *   - `↓` no último item (`canMoveDown = false`)
 * - Ambos ficam desabilitados enquanto `disabled` estiver ativo — a
 *   prop é passada pelo `useReorder` durante a requisição de persistência,
 *   evitando cliques duplos que causariam race conditions.
 *
 * Acessibilidade:
 * - `aria-label` em cada botão descreve a ação.
 */
import { ChevronUp, ChevronDown } from "lucide-react";

interface ReorderButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
}

export default function ReorderButtons({
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled = false,
}: ReorderButtonsProps) {
  const base =
    "flex items-center justify-center h-5 w-5 rounded text-[var(--color-muted)] hover:text-brand hover:bg-brand/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-muted)]";

  return (
    <div className="inline-flex flex-col">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp || disabled}
        aria-label="Mover para cima"
        className={base}
      >
        <ChevronUp size={14} />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown || disabled}
        aria-label="Mover para baixo"
        className={base}
      >
        <ChevronDown size={14} />
      </button>
    </div>
  );
}
