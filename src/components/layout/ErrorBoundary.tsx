/**
 * ErrorBoundary — Barreira de erro por subárvore de rotas.
 *
 * O problema que resolve:
 * - Qualquer erro não capturado em render (dados inesperados, código
 *   quebrado numa página lazy) desmonta a árvore inteira do React e
 *   deixa o usuário numa tela em branco. O boundary substitui isso por
 *   uma página de erro documentada, com botões explícitos de recuperação.
 *
 * Escopo (rota, não app):
 * - Cada "Route element" de topo em `PublicApp` e `AdminApp` é envolvido
 *   individualmente. Um erro no `/projetos` não derruba o `/sobre` —
 *   navegar pra outra rota restaura o app sem reload.
 *
 * Reset:
 * - `key={location.key}` no component interno: cada navegação cria uma
 *   nova instância, limpando o estado de erro. Botões de recuperação
 *   também limpam o estado sem reload.
 *
 * Variants:
 * - "public" — oferece "Voltar ao início"; erro em pt-BR neutro.
 * - "admin" — oferece "Recarregar o painel"; link direto pro portal.
 */
import { Component, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface BoundaryInnerProps {
  children: ReactNode;
  variant: "public" | "admin";
}

interface BoundaryState {
  error: Error | null;
}

class BoundaryInner extends Component<BoundaryInnerProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Consola o stack completo — em produção aparece no browser console
    // e no Netlify (aggregado). Se/que houver telemetria, plugar aqui.
    console.error(`ErrorBoundary (${this.props.variant}):`, error, errorInfo);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isAdmin = this.props.variant === "admin";

    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-background)] px-4 text-[var(--color-foreground)]">
        <main className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/15">
                  <AlertTriangle size={17} className="text-brand" />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    Algo deu errado nesta página.
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {isAdmin ? "Painel" : "Site"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                O resto do sistema continua funcionando normal. Você pode{" "}
                <button
                  type="button"
                  onClick={this.reset}
                  className="text-brand underline underline-offset-4 transition-colors hover:text-brand-hover"
                >
                  tentar de novo
                </button>
                {" "}
                {isAdmin ? "ou recarregar o painel." : "ou voltar ao início."}
              </p>

              {error.message && (
                <p className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 font-mono text-[11px] break-words text-[var(--color-muted-foreground)]">
                  {error.message}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={this.reset}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
                >
                  Tentar novamente
                </button>
                <a
                  href="/"
                  className="inline-flex h-10 items-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:border-brand/50"
                >
                  {isAdmin ? "Ir para o painel" : "Voltar ao início"}
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

/**
 * Wrapper funcional: `useLocation` não existe em class components, então
 * a key de reset fica na camada externa e o estado de erro na interna.
 */
export default function ErrorBoundary({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "public" | "admin";
}) {
  const location = useLocation();
  return (
    <BoundaryInner key={location.key} variant={variant}>
      {children}
    </BoundaryInner>
  );
}
