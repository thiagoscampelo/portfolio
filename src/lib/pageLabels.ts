/**
 * pageLabels — Converte paths brutos em rótulos amigáveis.
 *
 * Usado no dashboard de analytics para que "Páginas mais visitadas"
 * mostre "Home" em vez de "/", "Sobre" em vez de "/sobre".
 *
 * Casos:
 * - Rotas estáticas conhecidas → nome legível.
 * - `/projetos/:slug` → "Projeto: :slug".
 * - Qualquer outra rota → mostra o path cru (fallback).
 *
 * Query strings são removidas para matching (`/projetos?tag=x` casa
 * com `/projetos`), mas o `path` original é preservado para tooltip.
 */

export interface PageLabel {
  /** Rótulo amigável exibido na lista. */
  label: string;
  /** Path original (com query string), usado como tooltip. */
  path: string;
  /** True quando é uma rota dinâmica (`/projetos/:slug`). */
  isDynamic: boolean;
}

const STATIC_PATHS: Record<string, string> = {
  "/": "Home",
  "/projetos": "Projetos",
  "/experiencia": "Experiência",
  "/sobre": "Sobre",
  "/contato": "Contato",
};

export function describePath(rawPath: string): PageLabel {
  // Remove query string e normaliza trailing slash
  const path = rawPath.split("?")[0].replace(/\/$/, "") || "/";

  if (STATIC_PATHS[path]) {
    return { label: STATIC_PATHS[path], path: rawPath, isDynamic: false };
  }

  const projectMatch = path.match(/^\/projetos\/(.+)$/);
  if (projectMatch) {
    return {
      label: `Projeto: ${projectMatch[1]}`,
      path: rawPath,
      isDynamic: true,
    };
  }

  return { label: rawPath, path: rawPath, isDynamic: false };
}
