/**
 * SmartImage — Wrapper de `<img>` com fallback e otimizações.
 *
 * Responsabilidade:
 * - Centraliza `loading`, `decoding` e `fetchPriority` — evitando que cada
 *   componente tenha que configurar isso manualmente.
 * - **Fallback automático**: se `src` for `null`/`undefined`, ou se a URL
 *   falhar ao carregar (`onError`), renderiza o `fallback` em vez do
 *   ícone quebrado do browser.
 * - **Lazy por padrão**: imagens só carregam quando entram na viewport.
 *   A prop `priority` inverte isso — usa `eager` + `fetchPriority="high"`.
 *
 * Quando usar `priority`:
 * - Imagem acima da dobra (avatar do Hero, por exemplo).
 * - Nunca em mais de 1-2 imagens por página — múltiplas `priority` anulam
 *   o benefício.
 *
 * Comportamento de erro:
 * - Loga um `console.warn` para diagnóstico, mas não quebra a renderização.
 * - O estado `failed` impede o browser de tentar carregar de novo.
 */
import { useState, type ReactNode } from "react";

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback: ReactNode;
  priority?: boolean;
}

export default function SmartImage({
  src,
  alt,
  className = "",
  fallback,
  priority = false,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => {
        console.warn("[SmartImage] falhou ao carregar:", src);
        setFailed(true);
      }}
      className={className}
    />
  );
}
