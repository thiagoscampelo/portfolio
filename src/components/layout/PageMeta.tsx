/**
 * PageMeta — Metadados da página (title, description, OG, Twitter, canonical).
 *
 * Uso:
 *   <PageMeta
 *     title="Projetos"
 *     description="Uma coleção de aplicações..."
 *   />
 *
 * Como funciona (React 19):
 * - React 19 hoist automaticamente tags `<title>` e `<meta>` renderizadas
 *   em qualquer lugar da árvore para o `<head>`. Não precisa de Helmet
 *   nem de manipulação de DOM.
 * - Cada rota renderiza seu próprio `<PageMeta>` com valores específicos.
 *   O React substitui as tags de título/OG a cada navegação.
 *
 * Canonical:
 * - Calculada a partir do `pathname` + `SITE_URL`. O trailing slash é
 *   removido para evitar duplicação (`/projetos/` vs `/projetos`).
 *
 * Open Graph image:
 * - Fallback para `${SITE_URL}/og-image.png` quando nenhuma prop `image`
 *   é passada. Permite que páginas específicas (ex: detalhes de projeto)
 *   sobrescrevam com a capa do item.
 *
 * Twitter:
 * - `summary_large_image` — preview em formato banner, com a mesma imagem
 *   do OG.
 *
 * SEO adicional:
 * - As tags `<meta property="og:*">` também são duplicadas no `index.html`
 *   como fallback para bots que não executam JavaScript (ex: WhatsApp,
 *   LinkedIn).
 */
import { useLocation } from "react-router-dom";

interface PageMetaProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "profile";
}

const SITE_NAME = "Thiago Campelo";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://tscampelo.com.br";
const DEFAULT_DESCRIPTION =
  "Portfólio profissional de Thiago Campelo — Software Developer.";

// Imagem padrão de compartilhamento (1200x630)
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export default function PageMeta({
  title,
  description,
  image,
  type = "website",
}: PageMetaProps) {
  const { pathname } = useLocation();

  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;
  const ogImage = image || DEFAULT_OG_IMAGE;

  // Remove trailing slash pra evitar duplicação
  const cleanPath = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
  const canonicalUrl = `${SITE_URL}${cleanPath}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
