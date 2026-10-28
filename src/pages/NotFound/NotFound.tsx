/**
 * NotFound — Página 404 do site público.
 *
 * Estrutura:
 * - Container centralizado vertical e horizontalmente (`min-h-[70vh]`).
 * - Label "404 — Página não encontrada" (editável via `site_content`).
 * - H1 gigante com o número "404".
 * - Descrição curta (editável).
 * - Botão "Voltar para a Home" (editável) com estilo de CTA primário.
 *
 * Renderização:
 * - É montada tanto em `PublicApp` (rota `*`) quanto em `AdminApp`
 *   (fallback de rota).
 * - No contexto admin, o `AdminGuard` redireciona pra `/login` antes
 *   de chegar aqui — então essa tela é efetivamente vista só no público.
 *
 * Textos editáveis:
 * - `notfound_label`, `notfound_description`, `notfound_button`
 *   podem ser alterados na aba "Textos de Páginas" do admin.
 */
import { Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import PageMeta from "../../components/layout/PageMeta";
import { useSiteContent } from "../../hooks/useSiteContent";

export default function NotFound() {
  const { content } = useSiteContent();

  return (
    <>
      <PageMeta
        title="404 — Página não encontrada"
        description={
          content.notfound_description ||
          "A página que você está procurando não existe ou foi movida."
        }
      />

      <Container className="min-h-[70vh] flex flex-col items-center justify-center text-center py-20">
        <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
          {content.notfound_label || "404 — Página não encontrada"}
        </span>
        <h1 className="mt-4 text-7xl font-semibold tracking-[-0.04em] text-[var(--color-foreground)] sm:text-9xl">
          404
        </h1>
        <p className="mt-6 text-base leading-7 text-[var(--color-muted)] max-w-md">
          {content.notfound_description ||
            "A página que você está procurando não existe ou foi movida."}
        </p>
        <Link
          to="/"
          className="mt-10 bg-brand rounded-full px-8 h-12 flex items-center text-sm font-medium text-[#0d2119] hover:bg-brand-hover transition-colors duration-150"
        >
          {content.notfound_button || "Voltar para a Home"}
        </Link>
      </Container>
    </>
  );
}
