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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1">
            <Briefcase size={14} className="text-indigo-400" />
            <span>Trajetória Profissional</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
            Experiências
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Gerencie seu histórico de atuação, empresas e tecnologias
            utilizadas.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreateModal}
          className="relative z-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all border border-indigo-400/30"
        >
          <Plus size={18} /> Nova Experiência
        </motion.button>

        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Tabela — responsiva via scroll horizontal em mobile */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/30 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[760px]">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)]/60 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">
              <tr>
                <th className="px-6 py-4">Cargo &amp; Empresa</th>
                <th className="px-6 py-4">Período</th>
                <th className="px-6 py-4">Tecnologias</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]/60">
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
                      className="group hover:bg-[var(--color-background)]/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[var(--color-foreground)] group-hover:text-indigo-400 transition-colors">
                          {exp.role}
                        </p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {exp.company}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-[var(--color-muted)]">
                        {exp.period}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {exp.technologies && exp.technologies.length > 0 ? (
                            exp.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full bg-[var(--color-background)]/80 px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-muted)] border border-[var(--color-border)]"
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

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePublish(exp)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            exp.published
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
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

                      <td className="px-6 py-4 text-right">
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
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOpenEditModal(exp)}
                            className="p-2 rounded-xl text-[var(--color-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(exp)}
                            className="p-2 rounded-xl text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
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
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400 block mb-0.5">
                    {editingExp ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    {editingExp ? "Editar Experiência" : "Nova Experiência"}
                  </h2>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Cargo / Função
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Software Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Empresa / Organização
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Tech Solutions"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Período
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 2024 — Presente"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Identificador / Número
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Descrição das Responsabilidades
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Atuação no desenvolvimento de arquiteturas web escaláveis..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Tecnologias (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    value={technologiesInput}
                    onChange={(e) => setTechnologiesInput(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2 pb-2">
                  <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-[var(--color-foreground)]">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600"
                    />
                    Publicado
                  </label>
                </div>
              </form>

              <div className="p-4 px-6 border-t border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-end gap-3 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  form="exp-form"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50"
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
