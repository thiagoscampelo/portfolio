/**
 * Login — Tela de autenticação do admin (rota `/login`).
 *
 * Fica **fora** do `AdminGuard` e do `AdminLayout` — acessível sem
 * autenticação — mas usa a mesma linguagem visual do painel:
 * - Header de 64px com rótulo mono "Área restrita" e link de saída.
 * - Card no mesmo tom dos painéis (`--color-card`), borda hairline e
 *   raio de 12px, sem sombra.
 * - Rótulos mono, inputs escuros e botão primário verde.
 * - Lockup da marca (BrandMark + TSCAMPELO) dentro do card.
 *
 * Nada de grid decorativo, marcas de corte ou rodapé de página: a tela
 * deve parecer uma página do sistema, não uma landing isolada.
 *
 * Fluxo de submit:
 * 1. Validação local (campos vazios).
 * 2. `supabase.auth.signInWithPassword({ email, password })`.
 * 3. Sucesso → `navigate("/", { replace: true })`.
 * 4. Erro → mostra mensagem em bloco com `role="alert"`.
 *
 * Detalhes de UX:
 * - **Enter no campo de email** pula o foco para o campo de senha
 *   (não submete o form).
 * - **Toggle mostrar/ocultar senha** com ícone Eye/EyeOff.
 * - **Aviso de Caps Lock** aparece ao lado do rótulo da senha quando o
 *   modificador está ativo.
 * - **AutoComplete** ativado (`email` e `current-password`).
 * - Erros do Supabase em inglês são traduzidos para mensagens curtas.
 *
 * Link "Voltar para o site público":
 * - Usa `getPublicSiteUrl()` e um `<a>` (navegação full-page para outro
 *   subdomínio).
 *
 * Metadados:
 * - Não usa `PageMeta` — não faz sentido indexar a tela de login.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { getPublicSiteUrl } from "../../../lib/publicSite";
import BrandMark from "../../../components/Brandmark";

/** Traduz os erros mais comuns do Supabase Auth para pt-BR. */
function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "E-mail ou senha incorretos.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (/too many requests|rate limit/i.test(message)) {
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  }
  return message;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        { email, password },
      );

      if (authError) throw authError;

      if (data.session) {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      console.error("Erro ao entrar:", err);
      setError(
        friendlyAuthError(
          err.message || "Erro ao efetuar login. Verifique as credenciais.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Fundo da marca — glows discretos + grid técnico */}
      <div className="login-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Header — mesmo desenho do AdminHeader */}
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
          <span
            className="h-1 w-1 shrink-0 rounded-full bg-brand"
            aria-hidden="true"
          />
          Área restrita
        </div>

        <a
          href={getPublicSiteUrl()}
          className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
        >
          Voltar ao site
          <ArrowUpRight
            size={12}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </header>

      {/* Conteúdo */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[400px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
          {/* Lockup */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9 shrink-0" />
              <div className="leading-tight">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em]">
                  TSCAMPELO
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Software Development
                </p>
              </div>
            </div>

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Admin
            </span>
          </div>

          {/* Formulário */}
          <div className="px-5 py-6 sm:px-6">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              <span className="h-px w-5 bg-brand" aria-hidden="true" />
              Painel administrativo
            </p>

            <h1 className="mt-3 text-2xl font-medium leading-tight tracking-[-0.03em]">
              Acesso restrito
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Entre com as credenciais do administrador para continuar.
            </p>

            {error && (
              <div
                id="login-error"
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-[13px] leading-relaxed text-red-400"
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              {/* E-mail */}
              <div className="group">
                <label
                  htmlFor="login-email"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)] transition-colors group-focus-within:text-brand"
                >
                  E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      passwordInputRef.current?.focus();
                    }
                  }}
                  placeholder="voce@tscampelo.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className={`h-11 w-full rounded-lg border bg-[var(--color-background)] px-3.5 text-sm outline-none transition-colors placeholder:text-[#6f7a75] focus:ring-2 focus:ring-brand/15 ${
                    error
                      ? "border-red-500/40 focus:border-red-400"
                      : "border-[var(--color-border)] focus:border-brand"
                  }`}
                />
              </div>

              {/* Senha */}
              <div className="group">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)] transition-colors group-focus-within:text-brand"
                  >
                    Senha
                  </label>
                  <span
                    aria-live="polite"
                    className={`font-mono text-[9px] uppercase tracking-[0.14em] transition-colors ${
                      capsLock
                        ? "text-amber-300"
                        : "text-transparent select-none"
                    }`}
                  >
                    Caps lock
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) =>
                      setCapsLock(e.getModifierState("CapsLock"))
                    }
                    onKeyUp={(e) =>
                      setCapsLock(e.getModifierState("CapsLock"))
                    }
                    onBlur={() => setCapsLock(false)}
                    placeholder="Digite sua senha"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "login-error" : undefined}
                    className={`h-11 w-full rounded-lg border bg-[var(--color-background)] px-3.5 pr-11 text-sm outline-none transition-colors placeholder:text-[#6f7a75] focus:ring-2 focus:ring-brand/15 ${
                      error
                        ? "border-red-500/40 focus:border-red-400"
                        : "border-[var(--color-border)] focus:border-brand"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-muted)] outline-none transition-colors hover:bg-white/[0.04] hover:text-[var(--color-foreground)] focus-visible:ring-1 focus-visible:ring-brand"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-[13px] font-medium text-brand-contrast transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no painel
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Rodapé do card */}
          <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
            <span className="flex items-center gap-2">
              <ShieldCheck size={12} className="shrink-0" />
              Acesso exclusivo
            </span>
            <span>Auth · Supabase</span>
          </div>
        </div>
      </main>
    </div>
  );
}
