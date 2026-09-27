/**
 * AdminDashboard — Painel inicial do admin (rota `/`).
 *
 * Estrutura:
 * 1. Header com label + título.
 * 2. Grid de 6 stat cards (uma por tabela do CMS): mostra total,
 *    publicados e rascunhos de cada entidade.
 * 3. Grid 2 colunas:
 *    - Ações rápidas (atalhos para os CRUDs).
 *    - Status do perfil — barra de progresso + checklist do que
 *      está preenchido em `profiles` (avatar, bio, CV, etc).
 *
 * Componente interno `StatCard`:
 * - É um `<Link>` que navega pra tela do CRUD correspondente.
 * - Mostra o total como número grande; abaixo, "X publicados · Y rascunhos"
 *   quando aplicável.
 * - Usa `group` + `group-hover` para hover state consistente.
 *
 * Fonte de dados:
 * - `useDashboardStats()` — 12 queries paralelas (6 tabelas × 2 counts)
 *   com `head: true` (só count, sem payload de linhas). Muito mais rápido
 *   que `select("*")` e contar no client.
 * - `useProfile()` — para calcular completude do perfil.
 *
 * Checklist do perfil:
 * - Array `profileChecks` com 8 critérios (nome, cargo, bio, avatar,
 *   email, localização, CV, disponibilidade).
 * - `completeness` é a porcentagem de critérios preenchidos. Barra fica
 *   indigo em <100% e verde em 100%.
 */
import { motion } from "framer-motion";
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
  ArrowUpRight,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { useDashboardStats } from "../../../hooks/useDashboardStats";
import { useProfile } from "../../../hooks/useProfile";

/* ─────────── Stat Card ─────────── */

interface StatCardProps {
  label: string;
  path: string;
  icon: LucideIcon;
  total: number;
  published: number;
  loading: boolean;
}

function StatCard({
  label,
  path,
  icon: Icon,
  total,
  published,
  loading,
}: StatCardProps) {
  const drafts = total - published;

  return (
    <Link
      to={path}
      className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl p-6 hover:border-indigo-500/40 hover:bg-indigo-500/[0.03] transition-all duration-200 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Icon size={18} />
        </div>
        <ArrowUpRight
          size={16}
          className="text-[var(--color-muted)] group-hover:text-indigo-400 transition-colors"
        />
      </div>

      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-muted)]">
        {label}
      </p>

      {loading ? (
        <div className="mt-3 h-9 w-16 bg-[var(--color-border)]/40 rounded animate-pulse" />
      ) : (
        <>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)] leading-none">
            {total}
          </p>

          <p className="mt-3 text-xs text-[var(--color-muted)]">
            <span className="text-emerald-400 font-medium">{published}</span>{" "}
            publicado{published !== 1 ? "s" : ""}
            {drafts > 0 && (
              <>
                <span className="mx-1.5 text-[var(--color-border)]">·</span>
                <span className="text-[var(--color-muted-foreground)]">
                  {drafts} rascunho{drafts !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </p>
        </>
      )}
    </Link>
  );
}

/* ─────────── Dashboard ─────────── */

export default function AdminDashboard() {
  const { stats, loading } = useDashboardStats();
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
    { label: "Novo projeto", path: "/projetos", icon: FolderKanban },
    { label: "Nova experiência", path: "/experiencia", icon: Briefcase },
    { label: "Nova habilidade", path: "/habilidades", icon: Code2 },
    { label: "Editar perfil", path: "/perfil", icon: LayoutDashboard },
  ];

  /* Stat cards */
  const statCards = [
    {
      label: "Projetos",
      path: "/projetos",
      icon: FolderKanban,
      ...stats.projects,
    },
    {
      label: "Experiências",
      path: "/experiencia",
      icon: Briefcase,
      ...stats.experiences,
    },
    {
      label: "Habilidades",
      path: "/habilidades",
      icon: Code2,
      ...stats.skills,
    },
    {
      label: "Formação",
      path: "/educacao",
      icon: GraduationCap,
      ...stats.education,
    },
    {
      label: "Links Sociais",
      path: "/links-sociais",
      icon: Share2,
      ...stats.socialLinks,
    },
    {
      label: "Colaborações",
      path: "/colaboracoes",
      icon: Handshake,
      ...stats.collaborations,
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1">
            <LayoutDashboard size={14} className="text-indigo-400" />
            <span>Visão Geral</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Um panorama do conteúdo do seu portfólio.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <StatCard
              label={card.label}
              path={card.path}
              icon={card.icon}
              total={card.total}
              published={card.published}
              loading={loading}
            />
          </motion.div>
        ))}
      </div>

      {/* Painéis inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        {/* Ações rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl p-6"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] mb-4">
            Ações rápidas
          </h2>

          <div className="flex flex-col gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path + action.label}
                  to={action.path}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-background)]/60 transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Icon size={15} />
                  </div>
                  <span className="flex-1">{action.label}</span>
                  <Plus
                    size={14}
                    className="text-[var(--color-muted)] group-hover:text-indigo-400 transition-colors"
                  />
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Status do perfil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Status do perfil
            </h2>
            <span className="text-xs font-mono text-[var(--color-muted)]">
              {completedChecks}/{profileChecks.length}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]/40 overflow-hidden mb-5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className={`h-full rounded-full ${
                completeness === 100 ? "bg-emerald-500" : "bg-indigo-500"
              }`}
            />
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profileChecks.map((check) => (
              <div
                key={check.label}
                className="flex items-center gap-2.5 text-xs"
              >
                {check.done ? (
                  <CheckCircle2
                    size={14}
                    className="text-emerald-400 shrink-0"
                  />
                ) : (
                  <Circle
                    size={14}
                    className="text-[var(--color-muted)]/40 shrink-0"
                  />
                )}
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
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            Editar perfil
            <ArrowUpRight
              size={12}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
