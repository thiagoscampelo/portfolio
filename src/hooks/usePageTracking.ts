/**
 * usePageTracking — Registra page views para o analytics próprio.
 *
 * Regras:
 * - Só roda em produção (`import.meta.env.PROD`)
 * - Ignora referrer interno (navegação do próprio site)
 * - Usa sessionStorage para "visitante único por aba" (sem cookies, sem PII)
 * - Fire-and-forget: falhas não bloqueiam a navegação
 *
 * Sobre o referrer em SPA:
 * - `document.referrer` só muda quando um documento novo é carregado.
 *   Trocar de rota no React Router não dispara carregamento, então todas
 *   as views da mesma sessão herdariam o referrer da entrada — inflando
 *   o "top referrers" (LinkedIn apareceria 5x se o usuário viesse de lá
 *   e navegasse 5 páginas).
 * - Guardamos o referrer de entrada uma única vez em sessionStorage e o
 *   reutilizamos. Só o hostname (não a URL completa) — menos dado pessoal
 *   e alinhado com minimização da LGPD.
 *
 * Sobre o path:
 * - Só `pathname`, sem query string. `?fbclid=` e `?utm_*` fragmentam
 *   o ranking sem agregar valor. Se no futuro precisar de params
 *   específicos, filtrar com allowlist aqui.
 *
 * Sobre `crypto.randomUUID()`:
 * - Só existe em Secure Context (HTTPS ou localhost). Em HTTP via IP de
 *   rede, é undefined e chamá-lo lançaria TypeError — que quebraria a
 *   árvore React. Por isso há fallback.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const SESSION_ID_KEY = "pv_session_id";
const ENTRY_REFERRER_KEY = "pv_entry_referrer";
// Sentinela que distingue "ainda não calculamos" de "calculamos e era
// tráfego direto (vazio)". Sem isso, cada view tentaria recalcular e
// sobrescreveria um vazio por outro vazio.
const ENTRY_REFERRER_EMPTY = "__direct__";

/**
 * Gera um ID pseudo-aleatório seguro para uso como session ID.
 * Não é criptograficamente forte — é só um identificador para agrupar
 * page views da mesma sessão.
 */
function generateSessionId(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // cai no fallback
  }
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return generateSessionId();
  }
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
    return "tablet";
  }
  if (/mobile|iphone|ipod/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

/**
 * Extrai o hostname de uma URL externa.
 * Retorna null se a URL for interna, inválida ou vazia.
 *
 * Comparação por hostname parseado (não substring). `evil-tscampelo.com`
 * contém "tscampelo" mas não é o nosso domínio.
 */
function externalHostname(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.hostname === window.location.hostname) return null;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Recupera (ou calcula e memoriza) o referrer de entrada da sessão.
 */
function getEntryReferrer(): string | null {
  try {
    const cached = sessionStorage.getItem(ENTRY_REFERRER_KEY);
    if (cached === ENTRY_REFERRER_EMPTY) return null;
    if (cached) return cached;

    const hostname = externalHostname(document.referrer);
    sessionStorage.setItem(
      ENTRY_REFERRER_KEY,
      hostname ?? ENTRY_REFERRER_EMPTY,
    );
    return hostname;
  } catch {
    // sessionStorage indisponível — cai no cálculo direto
    return externalHostname(document.referrer);
  }
}

export function usePageTracking() {
  const { pathname } = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    try {
      const payload = {
        path: pathname.slice(0, 512),
        referrer: getEntryReferrer(),
        user_agent: navigator.userAgent.slice(0, 512),
        device: detectDevice(),
        session_id: getSessionId(),
      };

      void supabase
        .from("page_views")
        .insert(payload)
        .then(({ error }) => {
          if (error)
            console.warn("[analytics] falha ao registrar view:", error);
        });
    } catch (err) {
      console.warn("[analytics] erro ao montar payload:", err);
    }
  }, [pathname]);
}
