/**
 * Login — Tela de autenticação do admin (rota `/login`).
 *
 * Fica **fora** do `AdminGuard` e do `AdminLayout` — acessível sem
 * autenticação, e sem sidebar/header do painel.
 *
 * Fluxo de submit:
 * 1. Validação local (campos vazios).
 * 2. `supabase.auth.signInWithPassword({ email, password })`.
 * 3. Sucesso → `navigate("/", { replace: true })`.
 * 4. Erro → mostra mensagem em bloco vermelho com `role="alert"`.
 *
 * Detalhes de UX:
 * - **Enter no campo de email** pula o foco para o campo de senha
 *   (não submete o form). Isso é feito com `onKeyDown` + `preventDefault`
 *   e um `ref` no input de senha.
 * - **Toggle mostrar/ocultar senha** com ícone Eye/EyeOff. `aria-label`
 *   dinâmico para leitores de tela.
 * - **AutoComplete** ativado (`email` e `current-password`) para que
 *   gerenciadores de senha do browser reconheçam os campos.
 * - **Backdrop decorativo** com dois blobs indigo/violet animados.
 * - **Card em glass** com `backdrop-blur-2xl`.
 *
 * Link "Voltar para o site público":
 * - Usa `getPublicSiteUrl()` para calcular a URL do site público a partir
 *   do hostname atual (troca `admin.*` → hostname puro). Usa `<a>` (não
 *   `<Link>`) porque é uma navegação full-page para outro subdomínio.
 *
 * Metadados:
 * - Não usa `PageMeta` — não faz sentido indexar a tela de login.
 * - Não renderiza blobs em mobile (perf) — o `motion.div` de blobs roda
 *   em todas as larguras, mas com animações curtas (16s e 20s).
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowUpRight } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { getPublicSiteUrl } from "../../../lib/publicSite";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        err.message || "Erro ao efetuar login. Verifique as credenciais.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6 relative overflow-hidden">
      {/* Blobs decorativos */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/[0.06] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-600/[0.05] blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/60 backdrop-blur-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Painel Administrativo
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
              Acesso restrito
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Entre com suas credenciais para continuar.
            </p>
          </div>

          {/* Erro */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-400"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2"
              >
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    passwordInputRef.current?.focus();
                  }
                }}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-3 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-3 pr-11 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl bg-indigo-600 font-medium text-sm text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar no painel"}
            </motion.button>
          </form>
        </div>

        {/* Link para o site público */}
        <div className="mt-6 text-center">
          <a
            href={getPublicSiteUrl()}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors group"
          >
            <span>Voltar para o site público</span>
            <ArrowUpRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
