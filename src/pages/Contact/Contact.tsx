/**
 * Contact — Página `/contato`.
 *
 * Estrutura (3 seções + hero):
 * - **Hero**: eyebrow + H1 + subtítulo editáveis via `site_content`.
 * - **01 — Canais**: e-mail em destaque + grid de social links com
 *   ícones, rótulo e seta ↗.
 * - **02 — Colaborações**: grid 2 colunas de cards com título e descrição.
 * - **03 — Contexto**: 3 células em linha com fuso, tempo de resposta
 *   e idiomas (puxados do perfil).
 *
 * Fontes de dados:
 * - `useProfile`        → email, location, timezone, responseTime, languages.
 * - `useSocialLinks`    → links sociais publicados.
 * - `useCollaborations` → tipos de colaboração aceitos.
 * - `useSiteContent`    → textos editáveis de cada seção.
 *
 * Sobre o e-mail:
 * - O e-mail é puxado de `profile.email` — sempre no topo da seção
 *   "01 — Canais". Não depende de `social_links` para existir.
 * - URLs sociais passam por `normalizeSocialUrl` na renderização para
 *   garantir formato correto mesmo se os dados estiverem antigos.
 *
 * Sobre o `<SocialIcon>`:
 * - Usa `as="span"` porque o componente interno do `react-social-icons`
 *   renderiza um `<a>` por padrão. Envolvê-lo em outro `<a>` geraria
 *   HTML inválido (link dentro de link).
 */
import { motion } from "framer-motion";
import { SocialIcon } from "react-social-icons";
import { Mail, MapPin } from "lucide-react";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import Skeleton from "../../components/layout/Skeleton";
import PageMeta from "../../components/layout/PageMeta";
import { useProfile } from "../../hooks/useProfile";
import { useSocialLinks } from "../../hooks/useSocialLinks";
import { useCollaborations } from "../../hooks/useCollaborations";
import { useSiteContent } from "../../hooks/useSiteContent";
import { normalizeSocialUrl } from "../../lib/socialUrl";

export default function Contact() {
  const { profile } = useProfile();
  const { links, loading: loadingLinks } = useSocialLinks();
  const { collaborations, loading: loadingCollab } = useCollaborations();
  const { content } = useSiteContent();

  const email = profile?.email || "contato@dominio.com.br";
  const location = profile?.location;

  // Controla se a seção "02 — Colaborações" é renderizada.
  // Enquanto carrega, mostramos (para os skeletons aparecerem).
  // Depois de carregar, some se não houver registros.
  const showCollaborations = loadingCollab || collaborations.length > 0;

  // Numeração dinâmica:
  // - Com colaborações → Contexto é "03".
  // - Sem colaborações → Contexto sobe para "02".
  const contextIndex = showCollaborations ? "03" : "02";

  return (
    <>
      <PageMeta
        title="Contato"
        description={
          content.contact_hero_subtitle ||
          "Vamos conversar sobre projetos, oportunidades ou ideias."
        }
      />

      <div className="pt-6 pb-16 sm:pt-10 sm:pb-20">
        {/* ═══════════ HERO ═══════════ */}
        <section className="border-b border-[var(--color-border)] pb-12 sm:pb-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
                {content.contact_hero_eyebrow || "Contato"}
              </span>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-foreground)] sm:text-6xl lg:text-7xl">
                {content.contact_hero_title || "Vamos conversar?"}
              </h1>
              <p className="mt-6 text-base leading-7 text-[var(--color-muted)] sm:text-lg sm:leading-8 max-w-2xl">
                {content.contact_hero_subtitle ||
                  "Estou disponível para novas oportunidades, projetos de desenvolvimento, consultorias ou simplesmente para trocar ideias sobre tecnologia."}
              </p>
            </motion.div>
          </Container>
        </section>

        {/* ═══════════ 01 — CANAIS ═══════════ */}
        <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
              >
                <SectionHeading
                  index="01"
                  label={content.contact_canals_label || "Canais"}
                  title={content.contact_canals_title || "Como me encontrar."}
                />

                {location && (
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                    <MapPin size={14} />
                    <span>{location}</span>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col gap-12"
              >
                {/* E-mail */}
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)] block mb-4">
                    E-mail profissional
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="group inline-flex items-center gap-3 text-2xl sm:text-3xl font-medium text-[var(--color-foreground)] hover:text-brand-deep transition-colors border-b border-[var(--color-border)] hover:border-brand-deep pb-2 break-all"
                  >
                    <Mail
                      size={22}
                      className="shrink-0 text-[var(--color-muted)] group-hover:text-brand-deep transition-colors"
                    />
                    <span>{email}</span>
                    <span className="text-xl transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </a>
                </div>

                {/* Redes */}
                {loadingLinks ? (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)] block mb-4">
                      Redes &amp; perfis
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Skeleton className="h-16 rounded-xl" />
                      <Skeleton className="h-16 rounded-xl" />
                    </div>
                  </div>
                ) : links.length > 0 ? (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)] block mb-4">
                      Redes &amp; perfis
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {links.map((link) => (
                        <a
                          key={link.id}
                          href={normalizeSocialUrl(link.platform, link.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-brand/40 hover:bg-brand/5 transition-colors duration-200 group"
                        >
                          <SocialIcon
                            as="span"
                            network={link.platform}
                            style={{ height: 28, width: 28 }}
                          />
                          <span className="text-sm font-medium text-[var(--color-foreground)]">
                            {link.label || link.platform}
                          </span>
                          <span className="ml-auto text-sm text-[var(--color-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                            ↗
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-[var(--color-border)] rounded-2xl">
                    <p className="text-sm text-[var(--color-muted)]">
                      Nenhum link social cadastrado no momento.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </Container>
        </section>

        {/* ═══════════ 02 — COLABORAÇÕES ═══════════ */}
        {showCollaborations && (
          <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                >
                  <SectionHeading
                    index="02"
                    label={content.contact_collab_label || "Colaborações"}
                    title={
                      content.contact_collab_title ||
                      "Como podemos trabalhar juntos."
                    }
                    description={
                      content.contact_collab_description ||
                      "Formatos de colaboração que costumo aceitar. Se o seu caso não estiver aqui, ainda vale conversar."
                    }
                  />
                </motion.div>

                {loadingCollab ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                  </motion.div>
                ) : collaborations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="py-16 text-center border border-dashed border-[var(--color-border)] rounded-2xl"
                  >
                    <p className="text-sm text-[var(--color-muted)]">
                      Nenhum tipo de colaboração cadastrado no momento.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {collaborations.map((collab, index) => (
                      <motion.div
                        key={collab.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.05 + index * 0.05 }}
                        className="group flex flex-col gap-3 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-brand/40 hover:bg-brand/[0.03] transition-all duration-200"
                      >
                        <h3 className="text-lg font-semibold tracking-[-0.01em] text-[var(--color-foreground)] group-hover:text-brand-deep transition-colors">
                          {collab.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                          {collab.description}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </Container>
          </section>
        )}


        {/* ═══════════ 03 — CONTEXTO ═══════════ */}
        <section className="py-12 sm:py-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
              >
                <SectionHeading
                  index={contextIndex}
                  label={content.contact_context_label || "Contexto"}
                  title={content.contact_context_title || "Quando e onde."}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--color-border)] rounded-2xl overflow-hidden border border-[var(--color-border)]"
              >
                <div className="bg-[var(--color-background)] p-6 flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Fuso horário
                  </span>
                  <span className="text-lg font-medium text-[var(--color-foreground)]">
                    {profile?.timezone || "—"}
                  </span>
                </div>

                <div className="bg-[var(--color-background)] p-6 flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Tempo de resposta
                  </span>
                  <span className="text-lg font-medium text-[var(--color-foreground)]">
                    {profile?.responseTime || "—"}
                  </span>
                </div>

                <div className="bg-[var(--color-background)] p-6 flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Idiomas
                  </span>
                  <span className="text-lg font-medium text-[var(--color-foreground)]">
                    {profile?.languages && profile.languages.length > 0
                      ? profile.languages.join(" · ")
                      : "—"}
                  </span>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
