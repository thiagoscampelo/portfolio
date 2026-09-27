/**
 * ScrollToTop — Reseta o scroll ao trocar de rota.
 *
 * Comportamento:
 * - Escuta mudanças em `location.pathname` e chama `window.scrollTo(0, 0)`.
 * - Não renderiza nada visualmente — só efeito colateral.
 *
 * Onde é montado:
 * - `PublicApp` e `AdminApp` — ambos precisam do comportamento.
 *
 * Nota sobre o admin:
 * - No admin, o scroll não é do `window` mas de um `<div className="flex-1
 *   overflow-y-auto">` dentro do `AdminLayout`. Como o `ScrollToTop` só
 *   afeta `window`, ele **não tem efeito no admin**.
 * - Isso é intencional: no admin, preservar a posição de scroll entre
 *   rotas é conveniente (voltar de um modal/formulário mantém o contexto).
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
