/**
 * Markdown — Renderizador de markdown com estilo editorial do site.
 *
 * Uso:
 *   <Markdown>{project.content}</Markdown>
 *
 * Aceita markdown básico: headings, bold, italic, listas, links,
 * código inline, blocos de código, blockquote, separador horizontal
 * e parágrafos.
 *
 * Design:
 * - Todos os elementos são mapeados para classes Tailwind com os
 *   tokens do design system (--color-foreground, --color-muted, etc).
 * - Tipografia herda do container (`text-base sm:text-lg`), com
 *   headings escalando a partir disso.
 * - Espaçamento vertical padronizado (`mt-*`/`mb-*`), com
 *   `first:mt-0` / `last:mb-0` para não criar margens órfãs.
 *
 * Notas de segurança:
 * - `markdown-to-jsx` NÃO renderiza HTML cru por padrão — tags como
 *   `<script>` viram texto. Como o conteúdo vem do admin (fonte
 *   confiável), não adicionamos sanitização extra.
 * - Links externos recebem `target="_blank"` + `rel="noopener noreferrer"`
 *   automaticamente.
 *
 * Por que `markdown-to-jsx` e não `react-markdown`:
 * - ~10 kB gzipped vs ~40 kB.
 * - Sem cadeia remark/rehype, sem plugins.
 * - Como só precisamos de markdown básico com estilo customizado, a
 *   API de overrides cobre 100% dos casos.
 */
import MarkdownLib from "markdown-to-jsx";

interface MarkdownProps {
  children: string;
  className?: string;
}

export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div
      className={`text-base sm:text-lg leading-relaxed text-[var(--color-muted)] ${className}`}
    >
      <MarkdownLib
        options={{
          overrides: {
            h1: {
              component: "h2",
              props: {
                className:
                  "mt-12 mb-4 text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)] first:mt-0",
              },
            },
            h2: {
              component: "h3",
              props: {
                className:
                  "mt-10 mb-3 text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] first:mt-0",
              },
            },
            h3: {
              component: "h4",
              props: {
                className:
                  "mt-8 mb-3 text-lg sm:text-xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] first:mt-0",
              },
            },
            p: {
              component: "p",
              props: { className: "mb-5 last:mb-0" },
            },
            ul: {
              component: "ul",
              props: { className: "mb-5 list-disc pl-6 space-y-2 last:mb-0" },
            },
            ol: {
              component: "ol",
              props: {
                className: "mb-5 list-decimal pl-6 space-y-2 last:mb-0",
              },
            },
            li: {
              component: "li",
              props: { className: "pl-1 marker:text-indigo-500" },
            },
            strong: {
              component: "strong",
              props: {
                className: "font-semibold text-[var(--color-foreground)]",
              },
            },
            em: {
              component: "em",
              props: { className: "italic" },
            },
            a: {
              component: "a",
              props: {
                target: "_blank",
                rel: "noopener noreferrer",
                className:
                  "text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-[var(--color-border)] hover:decoration-indigo-400 transition-colors",
              },
            },
            code: {
              component: "code",
              props: {
                className:
                  "rounded bg-[var(--color-card)] px-1.5 py-0.5 text-[0.9em] font-mono text-[var(--color-foreground)] border border-[var(--color-border)]",
              },
            },
            pre: {
              component: "pre",
              props: {
                className:
                  "mb-5 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm last:mb-0",
              },
            },
            blockquote: {
              component: "blockquote",
              props: {
                className:
                  "mb-5 border-l-2 border-indigo-500/40 pl-4 italic last:mb-0",
              },
            },
            hr: {
              component: "hr",
              props: { className: "my-8 border-[var(--color-border)]" },
            },
          },
        }}
      >
        {children}
      </MarkdownLib>
    </div>
  );
}
