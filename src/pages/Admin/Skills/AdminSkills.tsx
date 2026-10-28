/**
 * AdminSkills — CRUD de habilidades técnicas.
 *
 * Recursos:
 * - Nome + categoria (Frontend, Backend, Database, DevOps, Ferramentas, Outros)
 * - Toggle de publicação
 * - Reordenação via ↑↓
 *
 * Estado da tabela:
 * - Desktop: 4 colunas
 * - Mobile: scroll horizontal via `overflow-x-auto` + `min-w-[560px]`
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Code2,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { mapSkill } from "../../../lib/mappers";
import { useReorder } from "../../../hooks/useReorder";
import ReorderButtons from "../../../components/admin/ReorderButtons";
import type { Skill } from "../../../types";
import { useConfirm } from "../../../hooks/useConfirm";
import { useToast } from "../../../hooks/useToast";

const CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Ferramentas",
  "Outros",
];

export default function AdminSkills() {
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [published, setPublished] = useState(true);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      if (data) setSkills(data.map(mapSkill));
    } catch (err: any) {
      toastError("Erro ao carregar habilidades: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const { reorder, reordering } = useReorder<Skill>("skills", fetchSkills);

  function handleOpenCreateModal() {
    setEditingSkill(null);
    setName("");
    setCategory("Frontend");
    setPublished(true);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(skill: Skill) {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setPublished(skill.published);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const skillData = { name, category, published };

    try {
      if (editingSkill) {
        const { error } = await supabase
          .from("skills")
          .update(skillData)
          .eq("id", editingSkill.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("skills").insert([skillData]);
        if (error) throw error;
      }

      success(editingSkill ? "Habilidade atualizada." : "Habilidade criada.");
      setIsModalOpen(false);
      fetchSkills();
    } catch (err: any) {
      toastError("Erro ao salvar habilidade: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(skill: Skill) {
    try {
      const { error } = await supabase
        .from("skills")
        .update({ published: !skill.published })
        .eq("id", skill.id);
      if (error) throw error;
      success(
        skill.published ? "Habilidade ocultada." : "Habilidade publicada.",
      );
      fetchSkills();
    } catch (err: any) {
      toastError("Erro ao atualizar status: " + err.message);
    }
  }

  async function handleDelete(skill: Skill) {
    const ok = await confirm({
      title: "Excluir habilidade",
      message: `Tem certeza que deseja excluir "${skill.name}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "danger",
    });

    if (!ok) return;

    try {
      const { error } = await supabase
        .from("skills")
        .delete()
        .eq("id", skill.id);
      if (error) throw error;
      success("Habilidade excluída.");
      fetchSkills();
    } catch (err: any) {
      toastError("Erro ao excluir habilidade: " + err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            <Code2 size={14} className="text-brand" />
            <span>Competências Técnicas</span>
          </div>
          <h1 className="mt-3 text-[1.75rem] font-medium tracking-[-0.035em] text-[var(--color-foreground)] sm:text-[2rem]">
            Habilidades &amp; Ferramentas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            Gerencie as tecnologias exibidas no seu portfólio.
          </p>
        </div>

        <motion.button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
        >
          <Plus size={18} /> Nova Habilidade
        </motion.button>

      </motion.div>

      {/* Tabela — responsiva via scroll horizontal em mobile */}
      <motion.div
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[560px]">
            <thead className="border-b border-[var(--color-border)] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3.5">Tecnologia / Habilidade</th>
                <th className="px-5 py-3.5">Categoria</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-32 bg-[var(--color-border)]/60 rounded" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-24 bg-[var(--color-border)]/50 rounded" />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="h-6 w-20 bg-[var(--color-border)]/50 rounded-full mx-auto" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="h-7 w-16 bg-[var(--color-border)]/50 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : skills.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-[var(--color-muted)]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles
                        size={24}
                        className="text-[var(--color-muted)]/50 mb-1"
                      />
                      <p className="font-medium text-base text-[var(--color-foreground)]">
                        Nenhuma habilidade cadastrada
                      </p>
                      <p className="text-xs">
                        Clique em "Nova Habilidade" para adicionar.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {skills.map((skill, index) => (
                    <motion.tr
                      key={skill.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-semibold text-[var(--color-foreground)] group-hover:text-brand transition-colors">
                        {skill.name}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-muted)]">
                          {skill.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => togglePublish(skill)}
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                            skill.published
                              ? "bg-brand/10 text-brand border-brand/20"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          }`}
                        >
                          {skill.published ? (
                            <Eye size={13} />
                          ) : (
                            <EyeOff size={13} />
                          )}
                          {skill.published ? "Ativo" : "Oculto"}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ReorderButtons
                            onMoveUp={() => reorder(skills, index, "up")}
                            onMoveDown={() => reorder(skills, index, "down")}
                            canMoveUp={index > 0}
                            canMoveDown={index < skills.length - 1}
                            disabled={reordering}
                          />

                          <motion.button
                            onClick={() => handleOpenEditModal(skill)}
                            className="p-2 rounded-md text-[var(--color-muted)] hover:text-brand hover:bg-brand/10 border border-transparent hover:border-brand/20 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>

                          <motion.button
                            onClick={() => handleDelete(skill)}
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
              className="relative w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/40 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand block mb-1">
                    {editingSkill ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-lg font-medium tracking-[-0.02em] text-[var(--color-foreground)]">
                    {editingSkill ? "Editar Habilidade" : "Nova Habilidade"}
                  </h2>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md p-2 text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-foreground)]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Nome da Tecnologia / Habilidade
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: React / Next.js"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                  >
                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        className="bg-[var(--color-card)] text-[var(--color-foreground)]"
                      >
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-[var(--color-foreground)]">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 rounded accent-brand"
                    />
                    Visível no site público
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-foreground)]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Salvar Habilidade"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
