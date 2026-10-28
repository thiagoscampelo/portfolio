/**
 * AdminExperiences — CRUD de experiências profissionais.
 *
 * Recursos:
 * - Criação/edição/exclusão
 * - Toggle de publicação
 * - Reordenação via ↑↓
 *
 * Estado da tabela:
 * - Desktop: 5 colunas (Cargo & Empresa, Período, Tecnologias, Status, Ações)
 * - Mobile: scroll horizontal via `overflow-x-auto` + `min-w-[760px]`
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { mapExperience } from "../../../lib/mappers";
import { useReorder } from "../../../hooks/useReorder";
import ReorderButtons from "../../../components/admin/ReorderButtons";
import type { Experience } from "../../../types";
import { useConfirm } from "../../../hooks/useConfirm";
import { useToast } from "../../../hooks/useToast";

export default function AdminExperiences() {
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  const [number, setNumber] = useState("01");
  const [period, setPeriod] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [published, setPublished] = useState(true);

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise((r) => setTimeout(r, 350 - elapsed));
      }

      if (data) setExperiences(data.map(mapExperience));
    } catch (err: any) {
      toastError("Erro ao carregar experiências: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const { reorder, reordering } = useReorder<Experience>(
    "experiences",
    fetchExperiences,
  );

  function handleOpenCreateModal() {
    setEditingExp(null);
    setNumber(String(experiences.length + 1).padStart(2, "0"));
    setPeriod("");
    setRole("");
    setCompany("");
    setDescription("");
    setTechnologiesInput("");
    setPublished(true);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(exp: Experience) {
    setEditingExp(exp);
    setNumber(exp.number);
    setPeriod(exp.period);
    setRole(exp.role);
    setCompany(exp.company);
    setDescription(exp.description);
    setTechnologiesInput(exp.technologies ? exp.technologies.join(", ") : "");
    setPublished(exp.published);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const techArray = technologiesInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const expData = {
      number,
      period,
      role,
      company,
      description,
      technologies: techArray,
      published,
    };

    try {
      if (editingExp) {
        const { error } = await supabase
          .from("experiences")
          .update(expData)
          .eq("id", editingExp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("experiences").insert([expData]);
        if (error) throw error;
      }

      success(editingExp ? "Experiência atualizada." : "Experiência criada.");
      setIsModalOpen(false);
      fetchExperiences();
    } catch (err: any) {
      toastError("Erro ao salvar experiência: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(exp: Experience) {
    try {
      const { error } = await supabase
        .from("experiences")
        .update({ published: !exp.published })
        .eq("id", exp.id);
      if (error) throw error;
      success(
        exp.published ? "Experiência despublicada." : "Experiência publicada.",
      );
      fetchExperiences();
    } catch (err: any) {
      toastError("Erro ao atualizar status: " + err.message);
    }
  }

  async function handleDelete(exp: Experience) {
    const ok = await confirm({
      title: "Excluir experiência",
      message: `Tem certeza que deseja excluir "${exp.role} · ${exp.company}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "danger",
    });

    if (!ok) return;

    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", exp.id);
      if (error) throw error;
      success("Experiência excluída.");
      fetchExperiences();
    } catch (err: any) {
      toastError("Erro ao excluir experiência: " + err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            <Briefcase size={14} className="text-brand" />
            <span>Trajetória Profissional</span>
          </div>
          <h1 className="mt-3 text-[1.75rem] font-medium tracking-[-0.035em] text-[var(--color-foreground)] sm:text-[2rem]">
            Experiências
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            Gerencie seu histórico de atuação, empresas e tecnologias
            utilizadas.
          </p>
        </div>

        <motion.button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
        >
          <Plus size={18} /> Nova Experiência
        </motion.button>

      </motion.div>

      {/* Tabela — responsiva via scroll horizontal em mobile */}
      <motion.div
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[760px]">
            <thead className="border-b border-[var(--color-border)] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3.5">Cargo &amp; Empresa</th>
                <th className="px-5 py-3.5">Período</th>
                <th className="px-5 py-3.5">Tecnologias</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-48 bg-[var(--color-border)]/60 rounded mb-2" />
                      <div className="h-3 w-28 bg-[var(--color-border)]/30 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 bg-[var(--color-border)]/50 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-1.5">
                        <div className="h-5 w-14 bg-[var(--color-border)]/50 rounded-full" />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="h-6 w-24 bg-[var(--color-border)]/50 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="h-7 w-16 bg-[var(--color-border)]/50 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : experiences.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-[var(--color-muted)]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles
                        size={24}
                        className="text-[var(--color-muted)]/50 mb-1"
                      />
                      <p className="font-medium text-base text-[var(--color-foreground)]">
                        Nenhuma experiência cadastrada
                      </p>
                      <p className="text-xs">
                        Clique em "Nova Experiência" para adicionar a primeira.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {experiences.map((exp, index) => (
                    <motion.tr
                      key={exp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[var(--color-foreground)] group-hover:text-brand transition-colors">
                          {exp.role}
                        </p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {exp.company}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 text-xs font-medium text-[var(--color-muted)]">
                        {exp.period}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {exp.technologies && exp.technologies.length > 0 ? (
                            exp.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-md border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted)]"
                              >
                                {tech}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[var(--color-muted)]/50">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => togglePublish(exp)}
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                            exp.published
                              ? "bg-brand/10 text-brand border-brand/20"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          }`}
                        >
                          {exp.published ? (
                            <Eye size={13} />
                          ) : (
                            <EyeOff size={13} />
                          )}
                          {exp.published ? "Publicado" : "Rascunho"}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ReorderButtons
                            onMoveUp={() => reorder(experiences, index, "up")}
                            onMoveDown={() =>
                              reorder(experiences, index, "down")
                            }
                            canMoveUp={index > 0}
                            canMoveDown={index < experiences.length - 1}
                            disabled={reordering}
                          />

                          <motion.button
                            onClick={() => handleOpenEditModal(exp)}
                            className="p-2 rounded-md text-[var(--color-muted)] hover:text-brand hover:bg-brand/10 border border-transparent hover:border-brand/20 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>

                          <motion.button
                            onClick={() => handleDelete(exp)}
                            className="p-2 rounded-md text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/40 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5 shrink-0">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand block mb-1">
                    {editingExp ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-lg font-medium tracking-[-0.02em] text-[var(--color-foreground)]">
                    {editingExp ? "Editar Experiência" : "Nova Experiência"}
                  </h2>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md p-2 text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-foreground)]"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                id="exp-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Cargo / Função
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Software Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Empresa / Organização
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Tech Solutions"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Período
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 2024 — Presente"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Identificador / Número
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Descrição das Responsabilidades
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Atuação no desenvolvimento de arquiteturas web escaláveis..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Tecnologias (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    value={technologiesInput}
                    onChange={(e) => setTechnologiesInput(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2 pb-2">
                  <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-[var(--color-foreground)]">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 rounded accent-brand"
                    />
                    Publicado
                  </label>
                </div>
              </form>

              <div className="p-4 px-6 border-t border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-end gap-3 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-foreground)]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  form="exp-form"
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Experiência"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
