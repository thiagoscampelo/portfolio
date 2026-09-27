/**
 * Home — Página inicial do site público.
 *
 * Responsabilidade:
 * - Composição pura. Sem lógica, sem estado, sem hooks próprios.
 * - Renderiza as 5 seções na ordem editorial do site.
 *
 * Ordem das seções:
 * 1. `<Hero />`              — apresentação principal
 * 2. `<FeaturedProjects />`  — "01 — Projetos" (até 3 destacados)
 * 3. `<AboutPreview />`      — "02 — Sobre" (bio + filosofia)
 * 4. `<ExperiencePreview />` — "03 — Experiência" (até 3)
 * 5. `<ContactCTA />`        — "04 — Contato" (CTA de encerramento)
 *
 * Cada seção é responsável por buscar seus próprios dados via hooks
 * (`useProfile`, `useProjects`, etc). A Home não orquestra nada.
 */
import AboutPreview from "../../components/home/AboutPreview";
import ContactCTA from "../../components/home/ContactCTA";
import ExperiencePreview from "../../components/home/ExperiencePreview";
import FeaturedProjects from "../../components/home/FeaturedProjects";
import Hero from "../../components/home/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <AboutPreview />
      <ExperiencePreview />
      <ContactCTA />
    </>
  );
}
