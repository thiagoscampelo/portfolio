/**
 * Normaliza uma URL de link social baseado na plataforma.
 * - mailto: garante prefixo "mailto:"
 * - whatsapp: extrai dígitos e prefixa "https://wa.me/"
 * - telegram: aceita @handle ou t.me/… → "https://t.me/handle"
 * - demais: força "https://" se o protocolo estiver ausente
 */
export function normalizeSocialUrl(platform: string, raw: string): string {
  const url = raw.trim();
  if (!url) return "";

  const p = platform.toLowerCase();

  if (p === "mailto") {
    return url.startsWith("mailto:") ? url : `mailto:${url}`;
  }

  if (p === "whatsapp") {
    const digits = url.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "";
  }

  if (p === "telegram") {
    if (/^https?:\/\//i.test(url)) return url;
    const handle = url.replace(/^@/, "").replace(/^t\.me\//i, "");
    return `https://t.me/${handle}`;
  }

  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url.replace(/^\/+/, "")}`;
}

/**
 * Detecta a plataforma mais provável a partir do conteúdo da URL.
 * Usado para auto-selecionar o dropdown quando o usuário cola um link.
 */
export function detectPlatformFromUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;

  // E-mail puro (ex: foo@bar.com)
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return "mailto";

  // Número de telefone puro (só dígitos, +, espaços, parênteses, hífens)
  if (/^[+\d\s()-]{8,}$/.test(url)) return "whatsapp";

  const rules: Array<[RegExp, string]> = [
    [/github\.com/i, "github"],
    [/linkedin\.com/i, "linkedin"],
    [/(^|\/\/)x\.com|twitter\.com/i, "x"],
    [/instagram\.com/i, "instagram"],
    [/youtube\.com|youtu\.be/i, "youtube"],
    [/wa\.me|whatsapp\.com/i, "whatsapp"],
    [/t\.me|telegram\./i, "telegram"],
    [/discord\.(com|gg)/i, "discord"],
    [/^mailto:/i, "mailto"],
  ];

  for (const [pattern, platform] of rules) {
    if (pattern.test(url)) return platform;
  }

  return null;
}
