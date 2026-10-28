/**
 * AdminCollaborations — CRUD dos tipos de colaboração.
 *
 * Recursos:
 * - Título + descrição
 * - Toggle de publicação
 * - Reordenação via ↑↓
 *
 * Exibidos em: /contato → seção "02 — Colaborações".
 *
 * Estado da tabela:
 * - Desktop: 4 colunas (Título, Descrição, Status, Ações)
 * - Mobile: scroll horizontal via `overflow-x-auto` + `min-w-[700px]`
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Handshake,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { mapCollaboration } from "../../../lib/mappers";
import { useReorder } from "../../../hooks/useReorder";
import ReorderButtons from "../../../components/admin/ReorderButtons";
import type { Collaboration } from "../../../types";
import { useConfirm } from "../../../hooks/useConfirm";
import { useToast } from "../../../hooks/useToast";

export default function AdminCollaborations() {
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(
    null,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);

  const fetchCollaborations = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const { data, error } = await supabase
        .from("collaborations")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise((r) => setTimeout(r, 350 - elapsed));
      }

      if (data) setCollaborations(data.map(mapCollaboration));
    } catch (err: any) {
      toastError("Erro ao carregar colaborações: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  const { reorder, reordering } = useReorder<Collaboration>(
    "collaborations",
    fetchCollaborations,
  );

  function handleOpenCreate() {
    setEditingCollab(null);
    setTitle("");
    setDescription("");
    setPublished(true);
    setIsModalOpen(true);
  }

  function handleOpenEdit(collab: Collaboration) {
    setEditingCollab(collab);
    setTitle(collab.title);
    setDescription(collab.description);
    setPublished(collab.published);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const collabData = { title, description, published };

    try {
      if (editingCollab) {
        const { error } = await supabase
          .from("collaborations")
          .update(collabData)
          .eq("id", editingCollab.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("collaborations")
          .insert([collabData]);
        if (error) throw error;
      }
      success(
        editingCollab ? "Colaboração atualizada." : "Colaboração criada.",
      );
      setIsModalOpen(false);
      fetchCollaborations();
    } catch (err: any) {
      toastError("Erro ao salvar colaboração: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(collab: Collaboration) {
    try {
      const { error } = await supabase
        .from("collaborations")
        .update({ published: !collab.published })
        .eq("id", collab.id);
      if (error) throw error;
      success(
        collab.published
          ? "Colaboração despublicada."
          : "Colaboração publicada.",
      );
      fetchCollaborations();
    } catch (err: any) {
      toastError("Erro ao atualizar status: " + err.message);
    }
  }

  async function handleDelete(collab: Collaboration) {
    const ok = await confirm({
      title: "Excluir colaboração",
      message: `Tem certeza que deseja excluir "${collab.title}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "danger",
    });

    if (!ok) return;

    try {
      const { error } = await supabase
        .from("collaborations")
        .delete()
        .eq("id", collab.id);
      if (error) throw error;
      success("Colaboração excluída.");
      fetchCollaborations();
    } catch (err: any) {
      toastError("Erro ao excluir: " + err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            <Handshake size={14} className="text-brand" />
            <span>Formatos de Trabalho</span>
          </div>
          <h1 className="mt-3 text-[1.75rem] font-medium tracking-[-0.035em] text-[var(--color-foreground)] sm:text-[2rem]">
            Colaborações
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            Tipos de trabalho exibidos na página de Contato.
          </p>
        </div>

        <motion.button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
        >
          <Plus size={18} /> Nova Colaboração
        </motion.button>

      </motion.div>

      {/* Tabela — responsiva via scroll horizontal em mobile */}
      <motion.div
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead className="border-b border-[var(--color-border)] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3.5">Título</th>
                <th className="px-5 py-3.5">Descrição</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-40 bg-[var(--color-border)]/60 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-64 bg-[var(--color-border)]/50 rounded" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="h-6 w-24 bg-[var(--color-border)]/50 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="h-7 w-16 bg-[var(--color-border)]/50 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : collaborations.length === 0 ? (
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
                        Nenhuma colaboração cadastrada
                      </p>
                      <p className="text-xs">
                        Clique em "Nova Colaboração" para adicionar.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {collaborations.map((collab, index) => (
                    <motion.tr
                      key={collab.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[var(--color-foreground)] group-hover:text-brand transition-colors">
                          {collab.title}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-[var(--color-muted)] max-w-md">
                        <span className="line-clamp-2">
                          {collab.description}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => togglePublish(collab)}
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                            collab.published
                              ? "bg-brand/10 text-brand border-brand/20"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          }`}
                        >
                          {collab.published ? (
                            <Eye size={13} />
                          ) : (
                            <EyeOff size={13} />
                          )}
                          {collab.published ? "Publicado" : "Rascunho"}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ReorderButtons
                            onMoveUp={() =>
                              reorder(collaborations, index, "up")
                            }
                            onMoveDown={() =>
                              reorder(collaborations, index, "down")
                            }
                            canMoveUp={index > 0}
                            canMoveDown={index < collaborations.length - 1}
                            disabled={reordering}
                          />

                          <motion.button
                            onClick={() => handleOpenEdit(collab)}
                            className="p-2 rounded-md text-[var(--color-muted)] hover:text-brand hover:bg-brand/10 border border-transparent hover:border-brand/20 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>

                          <motion.button
                            onClick={() => handleDelete(collab)}
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
              className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/40 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5 shrink-0">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand block mb-1">
                    {editingCollab ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-lg font-medium tracking-[-0.02em] text-[var(--color-foreground)]">
                    {editingCollab ? "Editar Colaboração" : "Nova Colaboração"}
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
                id="collab-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
              >
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Freelance / Projetos pontuais"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Descrição
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Desenvolvimento de aplicações web sob demanda..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
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
                  form="collab-form"
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Colaboração"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
