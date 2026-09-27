/**
 * Retorna a URL do site público a partir do contexto atual.
 *
 * - Em `admin.seudominio.com.br`, retorna `https://seudominio.com.br`
 * - Em `admin.localhost`, retorna `http://localhost` (dev)
 * - Fallback: usa `VITE_SITE_URL` (env) se nada funcionar
 */
export function getPublicSiteUrl(): string {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_SITE_URL || "https://tscampelo.com.br";
  }

  const { protocol, hostname, port } = window.location;

  // Remove o prefixo "admin." se existir
  if (hostname.startsWith("admin.")) {
    const publicHostname = hostname.slice("admin.".length);
    const portPart = port ? `:${port}` : "";
    return `${protocol}//${publicHostname}${portPart}`;
  }

  // Não estamos num subdomínio admin — usa o env var como fallback
  return import.meta.env.VITE_SITE_URL || `${protocol}//${hostname}`;
}
