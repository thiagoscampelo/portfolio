/**
 * vite.config.ts — Configuração do Vite (bundler + dev server).
 *
 * Três responsabilidades:
 *
 * 1. **Tailwind CSS v4** via `@tailwindcss/vite`:
 *    - Substitui o antigo setup PostCSS. O plugin compila o `index.css`
 *      diretamente, incluindo o bloco `@theme` com os design tokens.
 *
 * 2. **`injectSiteUrl()` — plugin customizado**:
 *    - `robots.txt` — substitui o placeholder `__SITE_URL__` pelo valor
 *      real de `VITE_SITE_URL` após o build.
 *    - `sitemap.xml` — regenerado no build: rotas estáticas + uma URL
 *      por projeto publicado (consultado no Supabase, com `lastmod`).
 *    - Ambos rodam no hook `closeBundle` (depois de tudo em `dist/`).
 *    - Por que não em runtime: esses arquivos são estáticos — servidos
 *      pelo CDN do Netlify, não por JS. Precisam ter o domínio correto
 *      no momento do build.
 *    - Fallback `https://tscampelo.com.br` se a env var não estiver
 *      definida (útil para builds locais e CI).
 *
 * 3. **Dev server exposto na rede** (`server.host: true`):
 *    - Permite acesso via IP LAN em `pnpm dev` (útil para testar em
 *      dispositivos móveis).
 *    - Mesma coisa no `preview.host: true` para o build de produção
 *      servido localmente.
 */
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Plugin que substitui __SITE_URL__ e gera o sitemap no build.
 *
 * Dois trabalhos:
 * 1. `robots.txt` — troca o placeholder pelo domínio real.
 * 2. `sitemap.xml` — além da substituição, consulta `projects` no Supabase
 *    (apenas slugs publicados) e anexa uma URL por projeto, com `lastmod`
 *    derivado de `updated_at`. Sem o fetch, o sitemap continua válido
 *    com as 5 rotas estáticas do template.
 *
 * Por que build-time e não runtime: os arquivos são estáticos, servidos
 * pelo CDN do Netlify — crawlers só enxergam o que foi publicado.
 *
 * `apply: "build"` garante que o plugin só roda em `vite build`, não em
 * `vite dev` (onde os arquivos são servidos diretamente de /public sem
 * processamento).
 */
async function fetchPublishedProjects(env: Record<string, string>) {
  const base = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) return [];

  try {
    const params = new URLSearchParams({
      select: "slug,updated_at",
      published: "eq.true",
      order: "order.asc",
    });
    const res = await fetch(`${base}/rest/v1/projects?${params}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as {
      slug: string;
      updated_at: string | null;
    }[];
    return rows.filter((r) => Boolean(r?.slug));
  } catch {
    return [];
  }
}

function projectSitemapEntry(
  slug: string,
  updatedAt: string | null,
  siteUrl: string,
) {
  const lastmod =
    updatedAt && !Number.isNaN(Date.parse(updatedAt))
      ? updatedAt.slice(0, 10)
      : null;

  return [
    "  <url>",
    `    <loc>${siteUrl}/projetos/${slug}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    "    <changefreq>monthly</changefreq>",
    "    <priority>0.7</priority>",
    "  </url>",
  ].join("\n");
}

function injectSiteUrl(siteUrl: string, env: Record<string, string>) {
  return {
    name: "inject-site-url",
    apply: "build" as const,
    async closeBundle() {
      const distDir = resolve(process.cwd(), "dist");

      // 1. robots.txt — só troca o placeholder
      const robotsPath = resolve(distDir, "robots.txt");
      if (existsSync(robotsPath)) {
        const robots = readFileSync(robotsPath, "utf-8");
        writeFileSync(robotsPath, robots.replaceAll("__SITE_URL__", siteUrl));
      }

      // 2. sitemap.xml — rotas estáticas + detalhes de projeto
      const projects = await fetchPublishedProjects(env);
      const entry = (loc: string, freq: string, priority: string) =>
        [
          "  <url>",
          `    <loc>${loc}</loc>`,
          `    <changefreq>${freq}</changefreq>`,
          `    <priority>${priority}</priority>`,
          "  </url>",
        ].join("\n");

      const urls = [
        entry(`${siteUrl}/`, "weekly", "1.0"),
        entry(`${siteUrl}/projetos`, "weekly", "0.9"),
        entry(`${siteUrl}/experiencia`, "monthly", "0.8"),
        entry(`${siteUrl}/sobre`, "monthly", "0.8"),
        entry(`${siteUrl}/contato`, "monthly", "0.7"),
        ...projects.map((p) =>
          projectSitemapEntry(p.slug, p.updated_at, siteUrl),
        ),
      ];

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        "</urlset>",
      ].join("\n");

      const sitemapPath = resolve(distDir, "sitemap.xml");
      if (existsSync(sitemapPath)) {
        writeFileSync(sitemapPath, `${sitemap}\n`);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // `loadEnv` lê .env.local, .env.[mode], etc.
  // O segundo argumento `""` faz carregar TODAS as variáveis, não só as
  // prefixadas com `VITE_` (que é o comportamento padrão). Isso é
  // necessário porque `VITE_SITE_URL` é usada aqui no build-time, e não
  // passa pelo client.
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL || "https://tscampelo.com.br";

  return {
    plugins: [tailwindcss(), injectSiteUrl(siteUrl, env)],

    server: {
      host: true,
    },
    preview: {
      host: true,
    },
  };
});
