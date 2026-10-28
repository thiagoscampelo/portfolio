/**
 * AdminProjects — CRUD de projetos do portfólio.
 *
 * Recursos:
 * - Criação/edição/exclusão de projetos (com modal em glass)
 * - Upload de imagem de capa para o bucket `portfolio-assets/projects/`
 * - Editor de links do projeto: frontend, backend, demo, docs, figma,
 *   vídeo e outros. Cada link pode ter URL (clicável) ou não (privado,
 *   exibido como badge com cadeado no público).
 * - Toggle de publicação (rascunho/publicado)
 * - Toggle de destaque na Home (com limite visual de 3)
 * - Reordenação via ↑↓ (persiste `order` no Supabase)
 *
 * Estado da tabela:
 * - Desktop: 5 colunas.
 * - Mobile: rolagem horizontal (`overflow-x-auto` + `min-w-[760px]`).
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Layers,
  X,
  Sparkles,
  Upload,
  Loader2,
  ImageIcon,
  GripVertical,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { mapProject } from "../../../lib/mappers";
import { uploadFile } from "../../../lib/upload";
import { useReorder } from "../../../hooks/useReorder";
import ReorderButtons from "../../../components/admin/ReorderButtons";
import { useToast } from "../../../hooks/useToast";
import { useConfirm } from "../../../hooks/useConfirm";
import { PROJECT_LINK_TYPES } from "../../../lib/projectLinks";
import type { Project, ProjectLink, ProjectLinkType } from "../../../types";

const HOME_FEATURED_LIMIT = 3;

export default function AdminProjects() {
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);

  const featuredCount = projects.filter((p) => p.featured).length;
  const isOverLimit = featuredCount > HOME_FEATURED_LIMIT;

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise((r) => setTimeout(r, 350 - elapsed));
      }

      if (data) setProjects(data.map(mapProject));
    } catch (err: any) {
      toastError("Erro ao carregar projetos: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const { reorder, reordering } = useReorder<Project>(
    "projects",
    fetchProjects,
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!editingProject) {
      const generatedSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generatedSlug);
    }
  }

  function handleOpenCreateModal() {
    setEditingProject(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setContent("");
    setCoverImage("");
    setLinks([]);
    setTechnologiesInput("");
    setFeatured(false);
    setPublished(true);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(project: Project) {
    setEditingProject(project);
    setTitle(project.title);
    setSlug(project.slug);
    setDescription(project.description);
    setContent(project.content);
    setCoverImage(project.coverImage || "");
    setLinks(project.links || []);
    setTechnologiesInput(
      project.technologies ? project.technologies.join(", ") : "",
    );
    setFeatured(project.featured);
    setPublished(project.published);
    setIsModalOpen(true);
  }

  /* ─────────── Handlers do editor de links ─────────── */

  function handleAddLink() {
    setLinks((prev) => [...prev, { type: "frontend", label: "", url: "" }]);
  }

  function handleUpdateLink(index: number, patch: Partial<ProjectLink>) {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    );
  }

  function handleRemoveLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMoveLink(index: number, direction: "up" | "down") {
    setLinks((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const publicUrl = await uploadFile(file, "projects");
      setCoverImage(publicUrl);
    } catch (err: any) {
      toastError(err.message || "Erro ao enviar a imagem de capa.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const techArray = technologiesInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Sanitiza os links antes de enviar:
    // - Remove entradas com tipo inválido (defensivo).
    // - Converte strings vazias em null (o banco guarda null, não "").
    const sanitizedLinks = links.map((l) => ({
      type: l.type,
      label: l.label?.trim() || null,
      url: l.url?.trim() || null,
    }));

    const projectData = {
      title,
      slug,
      description,
      content,
      cover_image: coverImage || null,
      links: sanitizedLinks,
      technologies: techArray,
      featured,
      published,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert([projectData]);
        if (error) throw error;
      }

      success(editingProject ? "Projeto atualizado." : "Projeto criado.");
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      toastError("Erro ao salvar projeto: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(project: Project) {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ published: !project.published })
        .eq("id", project.id);
      if (error) throw error;
      success(
        project.published ? "Projeto despublicado." : "Projeto publicado.",
      );
      fetchProjects();
    } catch (err: any) {
      toastError("Erro ao atualizar status: " + err.message);
    }
  }

  async function toggleFeatured(project: Project) {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ featured: !project.featured })
        .eq("id", project.id);
      if (error) throw error;
      success(
        project.featured ? "Destaque removido." : "Projeto destacado na Home.",
      );
      fetchProjects();
    } catch (err: any) {
      toastError("Erro ao atualizar destaque: " + err.message);
    }
  }

  async function handleDelete(project: Project) {
    const ok = await confirm({
      title: "Excluir projeto",
      message: `Tem certeza que deseja excluir "${project.title}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "danger",
    });

    if (!ok) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);
      if (error) throw error;
      success("Projeto excluído.");
      fetchProjects();
    } catch (err: any) {
      toastError("Erro ao excluir projeto: " + err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--color-border)] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            <Layers size={14} className="text-brand" />
            <span>Gestão de Conteúdo</span>
          </div>
          <h1 className="mt-3 text-[1.75rem] font-medium tracking-[-0.035em] text-[var(--color-foreground)] sm:text-[2rem]">
            Projetos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            Organize, publique e gerencie as soluções exibidas em seu portfólio.
          </p>

          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
              isOverLimit
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-brand/20 bg-brand/[0.06] text-brand"
              }`}
          >
            <Star size={11} fill="currentColor" />
            <span>
              Destaques na home: {featuredCount}/{HOME_FEATURED_LIMIT}
            </span>
            {isOverLimit && (
              <span className="normal-case tracking-normal text-amber-400/80">
                — apenas os 3 primeiros aparecem
              </span>
            )}
          </div>
        </div>

        <motion.button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-brand-contrast transition-colors hover:bg-brand-hover shrink-0"
        >
          <Plus size={18} /> Novo Projeto
        </motion.button>

      </motion.div>

      {/* Tabela */}
      <motion.div
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[760px]">
            <thead className="border-b border-[var(--color-border)] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3.5">Projeto</th>
                <th className="px-5 py-3.5">Tecnologias</th>
                <th className="px-5 py-3.5 text-center">Destaque</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-48 bg-[var(--color-border)]/60 rounded mb-2" />
                      <div className="h-3 w-28 bg-[var(--color-border)]/30 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-1.5">
                        <div className="h-5 w-14 bg-[var(--color-border)]/50 rounded-full" />
                        <div className="h-5 w-16 bg-[var(--color-border)]/50 rounded-full" />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="h-6 w-6 bg-[var(--color-border)]/50 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="h-6 w-24 bg-[var(--color-border)]/50 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="h-7 w-16 bg-[var(--color-border)]/50 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
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
                        Nenhum projeto encontrado
                      </p>
                      <p className="text-xs">
                        Clique em "Novo Projeto" para adicionar o primeiro item.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {projects.map((p, index) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[var(--color-foreground)] group-hover:text-brand transition-colors">
                          {p.title}
                        </p>
                        <p className="text-xs font-mono text-[var(--color-muted)] mt-0.5">
                          /{p.slug}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {p.technologies && p.technologies.length > 0 ? (
                            p.technologies.map((tech) => (
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
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleFeatured(p)}
                          className={`p-2 rounded-xl border transition-all ${p.featured
                              ? "text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-lg shadow-amber-400/10"
                              : "text-[var(--color-muted)] border-transparent hover:border-[var(--color-border)] hover:text-[var(--color-foreground)]"
                            }`}
                          title={
                            p.featured
                              ? "Remover destaque da Home"
                              : `Destacar (aparece na Home se estiver nos ${HOME_FEATURED_LIMIT} primeiros por ordem)`
                          }
                        >
                          <Star
                            size={16}
                            fill={p.featured ? "currentColor" : "none"}
                          />
                        </motion.button>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => togglePublish(p)}
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${p.published
                              ? "bg-brand/10 text-brand border-brand/20"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            }`}
                        >
                          {p.published ? (
                            <Eye size={13} />
                          ) : (
                            <EyeOff size={13} />
                          )}
                          {p.published ? "Publicado" : "Rascunho"}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ReorderButtons
                            onMoveUp={() => reorder(projects, index, "up")}
                            onMoveDown={() => reorder(projects, index, "down")}
                            canMoveUp={index > 0}
                            canMoveDown={index < projects.length - 1}
                            disabled={reordering}
                          />

                          <motion.button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-md text-[var(--color-muted)] hover:text-brand hover:bg-brand/10 border border-transparent hover:border-brand/20 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>

                          <motion.button
                            onClick={() => handleDelete(p)}
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

      {/* Modal */}
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
                    {editingProject ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-lg font-medium tracking-[-0.02em] text-[var(--color-foreground)]">
                    {editingProject ? "Editar Projeto" : "Novo Projeto"}
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
                id="project-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
              >
                {/* Imagem de capa */}
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Imagem de Capa
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="relative aspect-[16/10] w-full sm:w-48 shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden flex items-center justify-center">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt="Preview da capa"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon
                          size={26}
                          className="text-[var(--color-muted)]/50"
                        />
                      )}
                    </div>

                    <div className="flex-1 w-full flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-brand cursor-pointer transition">
                        {uploadingCover ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin text-brand"
                            />
                            <span>Carregando...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>
                              {coverImage
                                ? "Substituir imagem"
                                : "Escolher imagem"}
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          disabled={uploadingCover}
                          className="hidden"
                        />
                      </label>

                      {coverImage && (
                        <button
                          type="button"
                          onClick={() => setCoverImage("")}
                          className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition shrink-0"
                          title="Remover imagem"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Título
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Slug
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-mono text-[var(--color-foreground)] outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Descrição Curta
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Conteúdo Detalhado (suporta markdown)
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-brand focus:ring-1 focus:ring-brand transition font-mono"
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Use `##` para títulos, `**negrito**`, `-` para listas e
                    `` `código` ``.
                  </p>
                </div>

                {/* Editor de links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Links do projeto
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/40 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-brand hover:border-brand/30 transition"
                    >
                      <Plus size={13} />
                      Adicionar
                    </button>
                  </div>

                  <p className="mb-4 text-xs text-[var(--color-muted)]">
                    Deixe a URL vazia para sinalizar um recurso privado
                    (aparece como badge com cadeado).
                  </p>

                  {links.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/40 px-4 py-6 text-center text-xs text-[var(--color-muted)]">
                      Nenhum link adicionado ainda.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {links.map((link, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 sm:grid-cols-[auto_120px_1fr_1.5fr_auto] gap-2 items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/40 p-2"
                        >
                          {/* Handle visual (indicador de ordem) */}
                          <div className="hidden sm:flex items-center justify-center text-[var(--color-muted)]/30 px-1">
                            <GripVertical size={14} />
                          </div>

                          {/* Tipo */}
                          <select
                            value={link.type}
                            onChange={(e) =>
                              handleUpdateLink(index, {
                                type: e.target.value as ProjectLinkType,
                              })
                            }
                            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]/60 px-2 py-1.5 text-xs text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                          >
                            {PROJECT_LINK_TYPES.map((t) => (
                              <option
                                key={t.value}
                                value={t.value}
                                className="bg-[var(--color-card)] text-[var(--color-foreground)]"
                              >
                                {t.label}
                              </option>
                            ))}
                          </select>

                          {/* Label custom */}
                          <input
                            type="text"
                            placeholder="Rótulo (opcional)"
                            value={link.label ?? ""}
                            onChange={(e) =>
                              handleUpdateLink(index, { label: e.target.value })
                            }
                            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]/60 px-2 py-1.5 text-xs text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                          />

                          {/* URL */}
                          <input
                            type="url"
                            placeholder="https://... (deixe vazio se privado)"
                            value={link.url ?? ""}
                            onChange={(e) =>
                              handleUpdateLink(index, { url: e.target.value })
                            }
                            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]/60 px-2 py-1.5 text-xs text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20"
                          />

                          {/* Ações */}
                          <div className="flex items-center gap-0.5 justify-end">
                            <button
                              type="button"
                              onClick={() => handleMoveLink(index, "up")}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-brand hover:bg-brand/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-muted)] transition"
                              title="Mover para cima"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m18 15-6-6-6 6" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLink(index, "down")}
                              disabled={index === links.length - 1}
                              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-brand hover:bg-brand/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-muted)] transition"
                              title="Mover para baixo"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(index)}
                              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Remover link"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Tecnologias (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Tailwind CSS"
                    value={technologiesInput}
                    onChange={(e) => setTechnologiesInput(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
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

                  <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-[var(--color-foreground)]">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 rounded accent-brand"
                    />
                    Destacar na Home
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
                  form="project-form"
                  disabled={saving || uploadingCover}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Projeto"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}