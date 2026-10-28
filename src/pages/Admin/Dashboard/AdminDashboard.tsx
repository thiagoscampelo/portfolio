/**
 * AdminDashboard — Painel inicial do admin (rota `/`).
 *
 * Estrutura:
 * 1. Cabeçalho editorial (eyebrow + título + descrição + atalho).
 * 2. "Inventário": painel único com uma linha por tabela do CMS,
 *    mostrando total, publicados e rascunhos. Substitui a grade de
 *    seis cards soltos — menos ruído, mais leitura em coluna.
 * 3. Grid de 2 colunas:
 *    - Ações rápidas (atalhos para os CRUDs).
 *    - Completude do perfil — número grande + barra fina + checklist.
 *
 * Fonte de dados:
 * - `useDashboardStats()` — 12 queries paralelas (6 tabelas × 2 counts)
 *   com `head: true` (só count, sem payload de linhas).
 * - `useProfile()` — para calcular completude do perfil.
 *
 * Checklist do perfil:
 * - Array `profileChecks` com 8 critérios (nome, cargo, bio, avatar,
 *   email, localização, CV, disponibilidade).
 * - Marcadores quadrados: preenchido (verde) ou vazio (contorno).
 */
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Code2,
  GraduationCap,
  Share2,
  Handshake,
  Plus,
  ArrowRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useDashboardStats } from "../../../hooks/useDashboardStats";
import { useProfile } from "../../../hooks/useProfile";

interface ContentRow {
  label: string;
  path: string;
  icon: LucideIcon;
  total: number;
  published: number;
}

export default function AdminDashboard() {
  const { stats, loading, error } = useDashboardStats();
  const { profile } = useProfile();

  /* Perfil — checklist */
  const profileChecks = [
    { label: "Nome", done: !!profile?.name },
    { label: "Cargo", done: !!profile?.role },
    { label: "Bio", done: !!profile?.bio },
    { label: "Avatar", done: !!profile?.avatarUrl },
    { label: "E-mail", done: !!profile?.email },
    { label: "Localização", done: !!profile?.location },
    { label: "Currículo", done: !!profile?.resumeUrl },
    { label: "Disponível para projetos", done: profile?.available === true },
  ];

  const completedChecks = profileChecks.filter((c) => c.done).length;
  const completeness = Math.round(
    (completedChecks / profileChecks.length) * 100,
  );

  /* Ações rápidas */
  const quickActions = [
    { label: "Novo projeto", hint: "Portfólio", path: "/projetos", icon: FolderKanban },
    { label: "Nova experiência", hint: "Currículo", path: "/experiencia", icon: Briefcase },
    { label: "Nova habilidade", hint: "Stack", path: "/habilidades", icon: Code2 },
    { label: "Editar perfil", hint: "Identidade", path: "/perfil", icon: LayoutDashboard },
  ];

  /* Inventário */
  const rows: ContentRow[] = [
    { label: "Projetos", path: "/projetos", icon: FolderKanban, ...stats.projects },
    { label: "Experiências", path: "/experiencia", icon: Briefcase, ...stats.experiences },
    { label: "Habilidades", path: "/habilidades", icon: Code2, ...stats.skills },
    { label: "Formação", path: "/educacao", icon: GraduationCap, ...stats.education },
    { label: "Links sociais", path: "/links-sociais", icon: Share2, ...stats.socialLinks },
    { label: "Colaborações", path: "/colaboracoes", icon: Handshake, ...stats.collaborations },
  ];

  const totalItems = rows.reduce((acc, r) => acc + r.total, 0);
  const totalPublished = rows.reduce((acc, r) => acc + r.published, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">
      {/* Cabeçalho */}
      <header className="border-b border-[var(--color-border)] pb-6">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
          <span className="h-px w-5 bg-brand" aria-hidden="true" />
          Visão geral
        </p>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-medium tracking-[-0.035em] text-[var(--color-foreground)] sm:text-[2rem]">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Conteúdo, publicação e completude do portfólio em uma leitura.
            </p>
          </div>

          <Link
            to="/analytics"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)] transition-colors hover:text-brand sm:self-auto"
          >
            Ver analytics
            <ArrowUpRight
              size={13}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </header>

      {/* Inventário */}
      <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Inventário
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]/80">
            {loading ? "carregando…" : `${totalItems} itens · ${totalPublished} publicados`}
          </span>
        </div>

        {error && (
          <p className="border-b border-[var(--color-border)] px-5 py-3 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => {
            const Icon = row.icon;
            const drafts = row.total - row.published;

            return (
              <Link
                key={row.label}
                to={row.path}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <Icon
                  size={15}
                  className="shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-brand"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--color-foreground)]">
                    {row.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {loading
                      ? "—"
                      : `${row.published} publicado${row.published === 1 ? "" : "s"} · ${drafts} rascunho${drafts === 1 ? "" : "s"}`}
                  </p>
                </div>

                <span className="font-mono text-base tabular-nums text-[var(--color-foreground)]">
                  {loading ? "—" : row.total}
                </span>

                <ArrowRight
                  size={14}
                  className="shrink-0 text-[var(--color-muted)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Painéis inferiores */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.15fr]">
        {/* Ações rápidas */}
        <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
          <h2 className="border-b border-[var(--color-border)] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Ações rápidas
          </h2>

          <div className="divide-y divide-[var(--color-border)]">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path + action.label}
                  to={action.path}
                  className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <Icon size={15} className="shrink-0 text-[var(--color-muted)]" />
                  <span className="flex-1 text-sm text-[var(--color-foreground)]">
                    {action.label}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-muted)]/70">
                    {action.hint}
                  </span>
                  <Plus
                    size={14}
                    className="shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-brand"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Completude do perfil */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Completude do perfil
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]/70">
              {completedChecks}/{profileChecks.length}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-4xl tabular-nums tracking-[-0.02em] text-[var(--color-foreground)]">
              {completeness}
            </span>
            <span className="font-mono text-sm text-[var(--color-muted)]">%</span>
          </div>

          {/* Barra de progresso */}
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                completeness === 100 ? "bg-brand-hover" : "bg-brand"
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>

          {/* Checklist */}
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {profileChecks.map((check) => (
              <div key={check.label} className="flex items-center gap-2.5 text-xs">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-[1px] ${
                    check.done
                      ? "bg-brand"
                      : "border border-[var(--color-border)] bg-transparent"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={
                    check.done
                      ? "text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)]"
                  }
                >
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/perfil"
            className="group mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-brand transition-colors hover:text-brand-hover"
          >
            Editar perfil
            <ArrowUpRight
              size={12}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </section>
      </div>
    </div>
  );
}
