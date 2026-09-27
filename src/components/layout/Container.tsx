/**
 * Container — Primitiva de layout que centraliza e limita a largura do
 * conteúdo, com padding horizontal responsivo.
 *
 * Regra de uso:
 * - **Sempre** envolver o conteúdo de uma seção pública com `<Container>`.
 * - Nunca escrever `mx-auto max-w-... px-...` diretamente nas páginas.
 *
 * A prop `className` é reservada para espaçamento vertical (`py-*`, `pt-*`,
 * `pb-*`) e layout interno (`grid`, `flex`). Nunca usar para sobrescrever
 * a largura ou o padding horizontal — isso quebra o sistema.
 *
 * Largura máxima: 1400px. Padding: 24 → 40 → 48 → 64px conforme o viewport.
 */
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-12 xl:px-16 ${className}`}
    >
      {children}
    </div>
  );
}
