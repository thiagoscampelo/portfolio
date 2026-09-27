/**
 * referrerClassifier — Classifica referrers por origem e tipo de tráfego.
 *
 * Recebe um hostname (o RPC normaliza antes de retornar) e devolve
 * `{ source, medium }`. Ex:
 *
 *   "google.com"      → { source: "Google",   medium: "search" }
 *   "linkedin.com"    → { source: "LinkedIn", medium: "social" }
 *   "github.com"      → { source: "GitHub",   medium: "referral" }
 *   null / vazio      → { source: "Direto",   medium: "direct" }
 *   "meublog.com.br"  → { source: "meublog.com.br", medium: "referral" }
 *
 * Por que classificar no client (e não no SQL):
 * - Regras evoluem com frequência (adicionar novas redes, ajustar
 *   categorias). Fazer no client evita uma migration por ajuste.
 * - O volume é baixo (limite de 10-50 referrers por chamada).
 *
 * Os `sourceKey` são chaves estáveis para deduplicação e uso futuro
 * (ex: ícone por source). Nunca mudam mesmo se o `source` for renomeado.
 */

export type ReferrerMedium =
  | "search"
  | "social"
  | "email"
  | "referral"
  | "direct";

export interface ClassifiedReferrer {
  /** Nome legível do source ("Google", "LinkedIn"). */
  source: string;
  /** Chave estável para dedupe ("google", "linkedin"). */
  sourceKey: string;
  /** Categoria do medium. */
  medium: ReferrerMedium;
  /** Label do medium em pt-BR ("Busca", "Social"). */
  mediumLabel: string;
}

const MEDIUM_LABELS: Record<ReferrerMedium, string> = {
  search: "Busca",
  social: "Social",
  email: "E-mail",
  referral: "Referral",
  direct: "Direto",
};

interface SourceRule {
  pattern: RegExp;
  source: string;
  sourceKey: string;
  medium: ReferrerMedium;
}

const SOURCE_RULES: SourceRule[] = [
  // ─── Buscadores ───
  {
    pattern: /(^|\.)google\./i,
    source: "Google",
    sourceKey: "google",
    medium: "search",
  },
  {
    pattern: /(^|\.)bing\./i,
    source: "Bing",
    sourceKey: "bing",
    medium: "search",
  },
  {
    pattern: /duckduckgo\./i,
    source: "DuckDuckGo",
    sourceKey: "duckduckgo",
    medium: "search",
  },
  {
    pattern: /(^|\.)yahoo\./i,
    source: "Yahoo",
    sourceKey: "yahoo",
    medium: "search",
  },

  // ─── Redes sociais ───
  {
    pattern: /linkedin\./i,
    source: "LinkedIn",
    sourceKey: "linkedin",
    medium: "social",
  },
  {
    pattern: /instagram\./i,
    source: "Instagram",
    sourceKey: "instagram",
    medium: "social",
  },
  {
    pattern: /facebook\./i,
    source: "Facebook",
    sourceKey: "facebook",
    medium: "social",
  },
  {
    pattern: /(^|\.)x\.com|twitter\.com/i,
    source: "Twitter / X",
    sourceKey: "twitter",
    medium: "social",
  },
  {
    pattern: /tiktok\./i,
    source: "TikTok",
    sourceKey: "tiktok",
    medium: "social",
  },
  {
    pattern: /youtube\.|youtu\.be/i,
    source: "YouTube",
    sourceKey: "youtube",
    medium: "social",
  },
  {
    pattern: /reddit\./i,
    source: "Reddit",
    sourceKey: "reddit",
    medium: "social",
  },
  {
    pattern: /threads\./i,
    source: "Threads",
    sourceKey: "threads",
    medium: "social",
  },

  // ─── Webmail ───
  {
    pattern: /mail\.google|outlook\.|protonmail|proton\.me/i,
    source: "E-mail",
    sourceKey: "email",
    medium: "email",
  },

  // ─── Comunidades dev ───
  {
    pattern: /github\./i,
    source: "GitHub",
    sourceKey: "github",
    medium: "referral",
  },
  {
    pattern: /gitlab\./i,
    source: "GitLab",
    sourceKey: "gitlab",
    medium: "referral",
  },
  {
    pattern: /medium\./i,
    source: "Medium",
    sourceKey: "medium",
    medium: "referral",
  },
  {
    pattern: /dev\.to/i,
    source: "DEV.to",
    sourceKey: "devto",
    medium: "referral",
  },
  {
    pattern: /stackoverflow\./i,
    source: "Stack Overflow",
    sourceKey: "stackoverflow",
    medium: "referral",
  },
];

/**
 * Classifica um referrer em source + medium.
 *
 * Aceita tanto hostname puro ("google.com") quanto URL completa
 * ("https://google.com/search?q=x") para robustez — o RPC normaliza
 * antes de retornar, mas mantemos o fallback caso o dado venha cru
 * (cache antigo, INSERT manual, etc).
 */
export function classifyReferrer(raw: string | null): ClassifiedReferrer {
  if (!raw || raw.trim() === "") {
    return {
      source: "Direto",
      sourceKey: "direct",
      medium: "direct",
      mediumLabel: MEDIUM_LABELS.direct,
    };
  }

  let hostname = raw.trim();

  // Se veio URL completa, extrai o hostname.
  if (/^https?:\/\//i.test(hostname)) {
    try {
      hostname = new URL(hostname).hostname;
    } catch {
      // mantém como está — regex abaixo ainda pode dar match
    }
  }

  // Remove `www.` e normaliza case.
  hostname = hostname.replace(/^www\./, "").toLowerCase();

  for (const rule of SOURCE_RULES) {
    if (rule.pattern.test(hostname)) {
      return {
        source: rule.source,
        sourceKey: rule.sourceKey,
        medium: rule.medium,
        mediumLabel: MEDIUM_LABELS[rule.medium],
      };
    }
  }

  // Fallback: usa o próprio hostname como source.
  return {
    source: hostname,
    sourceKey: hostname,
    medium: "referral",
    mediumLabel: MEDIUM_LABELS.referral,
  };
}

/**
 * Agrupa uma lista de referrers por `sourceKey` e soma as views.
 *
 * Útil porque múltiplos hostnames podem classificar para o mesmo source
 * (ex: "google.com" e "google.com.br" → ambos "Google"). A agregação
 * garante que o dashboard mostre uma linha só.
 */
export function aggregateReferrers(
  referrers: Array<{ referrer: string; views: number | bigint }>,
): Array<ClassifiedReferrer & { count: number }> {
  const map = new Map<string, ClassifiedReferrer & { count: number }>();

  for (const r of referrers) {
    const cls = classifyReferrer(r.referrer);
    const existing = map.get(cls.sourceKey);
    if (existing) {
      existing.count += Number(r.views);
    } else {
      map.set(cls.sourceKey, { ...cls, count: Number(r.views) });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
