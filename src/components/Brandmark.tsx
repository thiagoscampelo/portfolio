/**
 * BrandMark — Símbolo da marca (monograma "TC" do favicon, colorido).
 *
 * Uso:
 * - Sidebar do admin (dentro de um container grafite).
 * - Favicon (`public/favicon.svg` contém os mesmos paths e gradientes).
 *
 * Design:
 * - Mesmos paths e gradientes verdes/cinza do favicon.
 * - `useId` gera sufixos únicos para os gradientes, evitando colisão de
 *   `id` caso o componente seja renderizado mais de uma vez na página.
 * - `viewBox` mantém o recorte original do favicon para não distorcer
 *   as proporções do símbolo.
 *
 * Acessibilidade:
 * - `aria-hidden="true"` porque é sempre decorativo — o texto ao lado
 *   ("Portfolio") carrega o significado.
 */
import { useId } from "react";

interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className = "" }: BrandMarkProps) {
  // `useId` pode conter ":" — removemos para manter os ids válidos em URL.
  const uid = useId().replace(/:/g, "");
  const g1 = `brandmark-${uid}-g1`;
  const g2 = `brandmark-${uid}-g2`;
  const g3 = `brandmark-${uid}-g3`;
  const g4 = `brandmark-${uid}-g4`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="39.32 48.26 140.98 140.98"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={g1}
          gradientUnits="userSpaceOnUse"
          x1="104.13"
          y1="51.86"
          x2="98.12"
          y2="95.76"
        >
          <stop offset="0.071" stopColor="#2ec881" />
          <stop offset="0.214" stopColor="#28a46e" />
          <stop offset="0.357" stopColor="#279063" />
          <stop offset="0.5" stopColor="#278a61" />
          <stop offset="0.643" stopColor="#208f62" />
          <stop offset="0.786" stopColor="#1c9261" />
          <stop offset="0.929" stopColor="#1b8d5f" />
        </linearGradient>

        <linearGradient
          id={g2}
          gradientUnits="userSpaceOnUse"
          x1="65.03"
          y1="128.97"
          x2="99.26"
          y2="114.5"
        >
          <stop offset="0.071" stopColor="#889093" />
          <stop offset="0.214" stopColor="#7e878a" />
          <stop offset="0.357" stopColor="#767d80" />
          <stop offset="0.5" stopColor="#6a6f73" />
          <stop offset="0.643" stopColor="#62666b" />
          <stop offset="0.786" stopColor="#5a5d61" />
          <stop offset="0.929" stopColor="#53565b" />
        </linearGradient>

        <linearGradient
          id={g3}
          gradientUnits="userSpaceOnUse"
          x1="102.98"
          y1="86.27"
          x2="152.27"
          y2="142.8"
        >
          <stop offset="0.071" stopColor="#5d5f64" />
          <stop offset="0.214" stopColor="#5d6065" />
          <stop offset="0.357" stopColor="#65696d" />
          <stop offset="0.5" stopColor="#627974" />
          <stop offset="0.643" stopColor="#518f76" />
          <stop offset="0.786" stopColor="#2a9f6e" />
          <stop offset="0.929" stopColor="#21a76e" />
        </linearGradient>

        <linearGradient
          id={g4}
          gradientUnits="userSpaceOnUse"
          x1="112.92"
          y1="141.24"
          x2="124.31"
          y2="159.11"
        >
          <stop offset="0.071" stopColor="#20a66e" />
          <stop offset="0.214" stopColor="#22a36c" />
          <stop offset="0.357" stopColor="#23a16b" />
          <stop offset="0.5" stopColor="#23a06a" />
          <stop offset="0.643" stopColor="#23a26b" />
          <stop offset="0.786" stopColor="#21a46c" />
          <stop offset="0.929" stopColor="#22ad72" />
        </linearGradient>
      </defs>

      <path
        d="M172.75 61.25 L69.62 62.62 L46.88 88.75 L78.38 90.88 L85.62 84.12 L149.50 84.38 Z"
        fill={`url(#${g1})`}
      />
      <path
        d="M86.75 89.50 L78.00 99.25 L78.00 159.62 L96.38 142.50 L96.25 107.38 Z"
        fill={`url(#${g2})`}
      />
      <path
        d="M97.12 91.38 L103.62 105.75 L138.00 133.75 L147.25 144.25 L156.62 139.00 L156.25 121.50 L116.62 91.50 Z"
        fill={`url(#${g3})`}
      />
      <path
        d="M146.25 145.12 L127.00 133.00 L104.88 146.38 L96.38 176.25 Z"
        fill={`url(#${g4})`}
      />
    </svg>
  );
}
