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
 *    - Substitui o placeholder `__SITE_URL__` em `robots.txt` e
 *      `sitemap.xml` pelo valor real de `VITE_SITE_URL` após o build.
 *    - Roda no hook `closeBundle` (depois de tudo em `dist/`).
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
 * Plugin que substitui __SITE_URL__ nos arquivos de /public durante o build.
 *
 * Sem isso, o robots.txt e o sitemap.xml ficariam com placeholder fixo —
 * inúteis para crawlers em produção.
 *
 * `apply: "build"` garante que o plugin só roda em `vite build`, não em
 * `vite dev` (onde os arquivos são servidos diretamente de /public sem
 * processamento).
 */
function injectSiteUrl(siteUrl: string) {
  return {
    name: "inject-site-url",
    apply: "build" as const,
    closeBundle() {
      const filesToProcess = ["robots.txt", "sitemap.xml"];
      const distDir = resolve(process.cwd(), "dist");

      for (const file of filesToProcess) {
        const filePath = resolve(distDir, file);
        if (!existsSync(filePath)) continue;

        const content = readFileSync(filePath, "utf-8");
        writeFileSync(filePath, content.replaceAll("__SITE_URL__", siteUrl));
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
    plugins: [tailwindcss(), injectSiteUrl(siteUrl)],

    server: {
      host: true,
    },
    preview: {
      host: true,
    },
  };
});
