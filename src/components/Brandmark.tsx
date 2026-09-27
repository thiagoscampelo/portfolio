/**
 * BrandMark — Símbolo da marca (duas barras paralelas em diagonal).
 *
 * Uso:
 * - Sidebar do admin (dentro de um container com gradiente indigo).
 * - Favicon (`public/favicon.svg` contém o mesmo path).
 *
 * Design:
 * - Duas linhas inclinadas que evocam código (//) sem ser literal.
 * - Stroke em `currentColor` — herda a cor do elemento pai, permitindo
 *   uso em qualquer contexto (branco sobre gradiente, indigo sobre fundo
 *   escuro, etc).
 * - `strokeLinecap="round"` para terminações suaves.
 *
 * Acessibilidade:
 * - `aria-hidden="true"` porque é sempre decorativo — o texto ao lado
 *   ("Portfolio") carrega o significado.
 */
interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 18 L11 6" />
      <path d="M13 18 L16 6" />
    </svg>
  );
}
