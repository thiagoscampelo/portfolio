/**
 * Footer — Rodapé do site público.
 *
 * Estrutura (grid de 12 colunas em desktop):
 * - 5 col: Branding (nome, cargo + tagline, localização).
 * - 3 col: Navegação (links principais).
 * - 4 col: Conectar (e-mail fixo + ícones sociais do banco).
 *
 * Fontes de dados:
 * - `profile`: nome, cargo, e-mail, localização.
 * - `links` (via `useSocialLinks`): ícones de redes sociais.
 * - `content.footer_tagline`: texto da tagline (editável no admin).
 *
 * Detalhe sobre o e-mail:
 * - O ícone de e-mail **sempre** aparece, puxado de `profile.email`.
 *   Não depende de `social_links` — se o usuário quiser trocar o e-mail,
 *   muda no perfil. `mailto` foi removido de `COMMON_PLATFORMS` para
 *   evitar duplicação.
 *
 * Fallbacks:
 * - Todos os campos têm valor padrão hardcoded para evitar "undefined"
 *   na UI enquanto o Supabase responde.
 */
import { Link } from "react-router-dom";
import { SocialIcon } from "react-social-icons";
import Container from "./Container";
import { useProfile } from "../../hooks/useProfile";
import { useSocialLinks } from "../../hooks/useSocialLinks";
import { useSiteContent } from "../../hooks/useSiteContent";
import { normalizeSocialUrl } from "../../lib/socialUrl";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { profile } = useProfile();
  const { links } = useSocialLinks();
  const { content } = useSiteContent();

  const name = profile?.name || "Thiago Campelo";
  const role = profile?.role || "Software Developer";
  const email = profile?.email || "contato@tscampelo.com.br";
  const location = profile?.location || "Brasil / Atuação Remota";

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)] pt-16 pb-3">
      <Container className="flex flex-col gap-12">
        {/* Grid superior */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Branding */}
          <div className="md:col-span-5 flex flex-col justify-between gap-4">
            <div>
              <Link
                to="/"
                className="font-semibold tracking-[0.05em] uppercase text-sm text-[var(--color-foreground)]"
              >
                {name}
              </Link>
              <p className="mt-2 text-sm text-[var(--color-muted)] max-w-sm leading-relaxed">
                {role}{" "}
                {content.footer_tagline ||
                  "focado na construção de aplicações web modernas, elegantes e de alta performance."}
              </p>
            </div>
            <div className="text-xs text-[var(--color-muted-foreground)] font-mono">
              <span>{location}</span>
            </div>
          </div>

          {/* Navegação */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Navegação
            </span>
            <ul className="flex flex-col gap-2 text-sm font-medium text-[var(--color-muted)]">
              <li>
                <Link
                  to="/"
                  className="hover:text-[var(--color-foreground)] transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/projetos"
                  className="hover:text-[var(--color-foreground)] transition-colors"
                >
                  Projetos
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre"
                  className="hover:text-[var(--color-foreground)] transition-colors"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  to="/contato"
                  className="hover:text-[var(--color-foreground)] transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Conexões */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Conectar
            </span>
            <p className="text-sm text-[var(--color-muted)]">
              Sinta-se à vontade para enviar uma mensagem ou acompanhar minhas
              atualizações.
            </p>

            <div className="flex items-center gap-3 mt-1">
              <SocialIcon
                network="mailto"
                url={`mailto:${email}`}
                style={{ height: 32, width: 32 }}
              />

              {links.map((link) => (
                <SocialIcon
                  key={link.id}
                  network={link.platform}
                  url={normalizeSocialUrl(link.platform, link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ height: 32, width: 32 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="border-t border-[var(--color-border)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-muted-foreground)]">
          <p>
            © {currentYear} {name}. Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
