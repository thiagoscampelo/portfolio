/**
 * AdminEducation — CRUD de formação acadêmica.
 *
 * Recursos:
 * - Tipo: Graduação / Curso técnico / Certificação / Curso livre
 * - Curso, instituição, período e descrição opcional
 * - Toggle de publicação
 * - Reordenação via ↑↓
 *
 * Estado da tabela:
 * - Desktop: 5 colunas (inclui "Tipo")
 * - Mobile: scroll horizontal via `overflow-x-auto` + `min-w-[720px]`
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  Wrench,
  BadgeCheck,
  BookOpen,
  X,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { mapEducation } from "../../../lib/mappers";
import { useReorder } from "../../../hooks/useReorder";
import ReorderButtons from "../../../components/admin/ReorderButtons";
import { useToast } from "../../../hooks/useToast";
import { useConfirm } from "../../../hooks/useConfirm";
import type { Education, EducationType } from "../../../types";

/* ─────────── Configuração visual dos tipos ─────────── */

interface TypeMeta {
  value: EducationType;
  label: string;
  icon: LucideIcon;
  badgeClass: string;
}

const TYPE_META: TypeMeta[] = [
  {
    value: "degree",
    label: "Graduação",
    icon: GraduationCap,
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  {
    value: "technical",
    label: "Curso técnico",
    icon: Wrench,
    badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  {
    value: "certification",
    label: "Certificação",
    icon: BadgeCheck,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    value: "course",
    label: "Curso livre",
    icon: BookOpen,
    badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
];

function getTypeMeta(type: EducationType): TypeMeta {
  return TYPE_META.find((t) => t.value === type) ?? TYPE_META[0];
}

export default function AdminEducation() {
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);

  const [type, setType] = useState<EducationType>("degree");
  const [institution, setInstitution] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("");
  const [published, setPublished] = useState(true);

  const fetchEducation = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise((r) => setTimeout(r, 350 - elapsed));
      }

      if (data) setEducation(data.map(mapEducation));
    } catch (err: any) {
      toastError("Erro ao carregar formação: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const { reorder, reordering } = useReorder<Education>(
    "education",
    fetchEducation,
  );

  function handleOpenCreate() {
    setEditingEdu(null);
    setType("degree");
    setInstitution("");
    setCourse("");
    setDescription("");
    setPeriod("");
    setPublished(true);
    setIsModalOpen(true);
  }

  function handleOpenEdit(edu: Education) {
    setEditingEdu(edu);
    setType(edu.type);
    setInstitution(edu.institution);
    setCourse(edu.course);
    setDescription(edu.description || "");
    setPeriod(edu.period);
    setPublished(edu.published);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const eduData = {
      type,
      institution,
      course,
      description: description || null,
      period,
      published,
    };

    try {
      if (editingEdu) {
        const { error } = await supabase
          .from("education")
          .update(eduData)
          .eq("id", editingEdu.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("education").insert([eduData]);
        if (error) throw error;
      }
      success(editingEdu ? "Formação atualizada." : "Formação criada.");
      setIsModalOpen(false);
      fetchEducation();
    } catch (err: any) {
      toastError("Erro ao salvar formação: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(edu: Education) {
    try {
      const { error } = await supabase
        .from("education")
        .update({ published: !edu.published })
        .eq("id", edu.id);
      if (error) throw error;
      success(edu.published ? "Formação despublicada." : "Formação publicada.");
      fetchEducation();
    } catch (err: any) {
      toastError("Erro ao atualizar status: " + err.message);
    }
  }

  async function handleDelete(edu: Education) {
    const ok = await confirm({
      title: "Excluir formação",
      message: `Tem certeza que deseja excluir "${edu.course}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "danger",
    });

    if (!ok) return;

    try {
      const { error } = await supabase
        .from("education")
        .delete()
        .eq("id", edu.id);
      if (error) throw error;
      success("Formação excluída.");
      fetchEducation();
    } catch (err: any) {
      toastError("Erro ao excluir: " + err.message);
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
            <GraduationCap size={14} className="text-indigo-400" />
            <span>Base Acadêmica</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
            Formação
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Gerencie cursos, faculdades, certificações e formação técnica.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="relative z-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all border border-indigo-400/30"
        >
          <Plus size={18} /> Nova Formação
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
                <th className="px-6 py-4">Curso &amp; Instituição</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Período</th>
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
                      <div className="h-3 w-32 bg-[var(--color-border)]/30 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-24 bg-[var(--color-border)]/50 rounded-full" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 bg-[var(--color-border)]/50 rounded" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="h-6 w-24 bg-[var(--color-border)]/50 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="h-7 w-16 bg-[var(--color-border)]/50 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : education.length === 0 ? (
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
                        Nenhuma formação cadastrada
                      </p>
                      <p className="text-xs">
                        Clique em "Nova Formação" para adicionar.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {education.map((edu, index) => {
                    const meta = getTypeMeta(edu.type);
                    const TypeIcon = meta.icon;
                    return (
                      <motion.tr
                        key={edu.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="group hover:bg-[var(--color-background)]/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[var(--color-foreground)] group-hover:text-indigo-400 transition-colors">
                            {edu.course}
                          </p>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {edu.institution}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${meta.badgeClass}`}
                          >
                            <TypeIcon size={11} />
                            {meta.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-[var(--color-muted)]">
                          {edu.period}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => togglePublish(edu)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              edu.published
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            }`}
                          >
                            {edu.published ? (
                              <Eye size={13} />
                            ) : (
                              <EyeOff size={13} />
                            )}
                            {edu.published ? "Publicado" : "Rascunho"}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <ReorderButtons
                              onMoveUp={() => reorder(education, index, "up")}
                              onMoveDown={() =>
                                reorder(education, index, "down")
                              }
                              canMoveUp={index > 0}
                              canMoveDown={index < education.length - 1}
                              disabled={reordering}
                            />

                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleOpenEdit(edu)}
                              className="p-2 rounded-xl text-[var(--color-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(edu)}
                              className="p-2 rounded-xl text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
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
                    {editingEdu ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    {editingEdu ? "Editar Formação" : "Nova Formação"}
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
                id="edu-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
              >
                {/* Tipo */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Tipo de Formação
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TYPE_META.map((meta) => {
                      const Icon = meta.icon;
                      const isSelected = type === meta.value;
                      return (
                        <button
                          key={meta.value}
                          type="button"
                          onClick={() => setType(meta.value)}
                          className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-all ${
                            isSelected
                              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                              : "border-[var(--color-border)] bg-[var(--color-background)]/40 text-[var(--color-muted)] hover:border-[var(--color-border)]/80 hover:text-[var(--color-foreground)]"
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-center leading-tight">
                            {meta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Curso
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bacharelado em Ciência da Computação"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Instituição
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Universidade Federal"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Período
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 2016 — 2020 ou 40h"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Pode ser um intervalo de datas ou uma carga horária.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Formação sólida em algoritmos, estruturas de dados..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
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
                  form="edu-form"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Formação"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
