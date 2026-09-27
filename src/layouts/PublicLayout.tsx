/**
 * PublicLayout — Estrutura compartilhada entre todas as páginas públicas.
 *
 * Responsabilidade:
 * - Envolve cada página com Header e Footer.
 * - Injeta os blobs ambientes decorativos (fixos, atrás de tudo).
 * - Aplica o skip link de acessibilidade (visível só no Tab).
 * - Anima a transição entre rotas com Framer Motion (fade + y curto).
 *
 * Estrutura visual:
 *   <Header />
 *   <main> (com Suspense) → página atual
 *   <Footer />
 *
 * Skip link:
 * - `sr-only` esconde visualmente, mas fica acessível para leitores de tela.
 * - Ao ganhar foco (Tab), aparece como botão no canto superior esquerdo.
 * - Aponta para `#main-content`, permitindo pular a navegação.
 *
 * Blobs ambientes:
 * - `fixed inset-0 z-0` — cobrem toda a viewport, atrás de tudo.
 * - `pointer-events-none` — não interceptam cliques.
 * - Header e Footer têm fundo opaco por cima.
 *
 * AnimatePresence:
 * - Não usamos `AnimatePresence` com exit aqui de propósito. A transição
 *   de saída em rotas com React Router v7 exige congelar o outlet, o que
 *   causaria flicker. Apenas fade-in é suficiente e não arrisca bugs.
 * - `key={location.pathname}` força remontagem da animação a cada rota.
 */
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PageLoading from "../components/layout/PageLoading";

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col relative">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-xl"
      >
        Pular para o conteúdo
      </a>

      {/* Blobs ambientes */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/[0.04] blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-3xl" />
      </div>

      <Header />
      <main id="main-content" className="flex-1 relative z-10">
        <Suspense fallback={<PageLoading />}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
