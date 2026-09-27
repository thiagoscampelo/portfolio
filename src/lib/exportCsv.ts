/**
 * exportCsv — Geração de CSV client-side, sem dependências.
 *
 * Por que client-side: os dados já estão em memória (carregados pelo
 * useAnalytics). Montar o CSV aqui evita uma segunda ida ao servidor
 * e mantém o formato sob controle da UI.
 *
 * Formato:
 * - Campos com vírgula/aspas/quebra de linha são escapados com aspas duplas.
 * - Aspas dentro do campo são duplicadas (" → "").
 * - BOM UTF-8 no início para o Excel abrir com acentuação correta.
 *
 * Defesa contra CSV injection (OWASP):
 * - Excel e LibreOffice interpretam células que começam com `=`, `+`,
 *   `-`, `@`, TAB ou CR como fórmula. Prefixamos com apóstrofo `'`,
 *   que força a interpretação como texto. O caractere aparece na
 *   célula — é a convenção universal para neutralizar o vetor sem
 *   alterar o dado subjacente.
 * - A validação principal está no banco (CHECK em page_views.path
 *   exige barra inicial). Aqui é a segunda camada: mesmo que um novo
 *   campo passe a aceitar texto livre, a saída continua segura.
 */

interface CsvSection {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Gera e dispara o download de um CSV multi-seção.
 * Cada seção é separada por uma linha em branco + título.
 */
export function downloadCsv(filename: string, sections: CsvSection[]): void {
  const lines: string[] = [];

  for (const section of sections) {
    // Título da seção
    lines.push(escapeField(section.title));
    // Cabeçalhos
    lines.push(section.headers.map(escapeField).join(","));
    // Linhas
    for (const row of section.rows) {
      lines.push(row.map((v) => escapeField(String(v))).join(","));
    }
    // Linha em branco entre seções
    lines.push("");
  }

  const csv = lines.join("\n");

  // BOM para Excel reconhecer UTF-8
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapa um campo para CSV conforme RFC 4180 e neutraliza CSV injection.
 *
 * Ordem importa:
 * 1. Neutraliza primeiro (prefixa `'` se começar com gatilho de fórmula).
 * 2. Escapa depois (aspas/vírgula/newline) — assim o apóstrofo
 *    adicionado também entra no escape se necessário.
 *
 * O regex de neutralização inclui TAB e CR porque algumas versões do
 * Excel tratam `\t=cmd` ou `\r=cmd` como fórmula também.
 */
function escapeField(value: string): string {
  const needsNeutralize = /^[=+\-@\t\r]/.test(value);
  const safe = needsNeutralize ? `'${value}` : value;

  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}
