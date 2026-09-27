/**
 * AdminProjects — CRUD de projetos do portfólio.
 *
 * Recursos:
 * - Criação/edição/exclusão de projetos (com modal em glass)
 * - Upload de imagem de capa para o bucket `portfolio-assets/projects/`
 * - Toggle de publicação (rascunho/publicado)
 * - Toggle de destaque na Home (com limite visual de 3)
 * - Reordenação via ↑↓ (persiste `order` no Supabase)
 *
 * Estado da tabela:
 * - Em desktop, layout horizontal de 5 colunas.
 * - Em mobile, rolagem horizontal (`overflow-x-auto` + `min-w-[760px]`).
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
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { mapProject } from "../../../lib/mappers";
import { deleteFile, uploadFile } from "../../../lib/upload";
import { useReorder } from "../../../hooks/useReorder";
import ReorderButtons from "../../../components/admin/ReorderButtons";
import { useToast } from "../../../hooks/useToast";
import { useConfirm } from "../../../hooks/useConfirm";
import type { Project } from "../../../types";

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
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [persistedCoverImage, setPersistedCoverImage] = useState("");

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
    setPersistedCoverImage("");
    setGithubUrl("");
    setDemoUrl("");
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
    setPersistedCoverImage(project.coverImage || "");
    setGithubUrl(project.githubUrl || "");
    setDemoUrl(project.demoUrl || "");
    setTechnologiesInput(
      project.technologies ? project.technologies.join(", ") : "",
    );
    setFeatured(project.featured);
    setPublished(project.published);
    setIsModalOpen(true);
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

    const projectData = {
      title,
      slug,
      description,
      content,
      cover_image: coverImage || null,
      github_url: githubUrl || null,
      demo_url: demoUrl || null,
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
      
      if (
        editingProject &&
        persistedCoverImage &&
        persistedCoverImage !== coverImage
      ) {
        await deleteFile(persistedCoverImage);
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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1">
            <Layers size={14} className="text-indigo-400" />
            <span>Gestão de Conteúdo</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
            Projetos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Organize, publique e gerencie as soluções exibidas em seu portfólio.
          </p>

          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
              isOverLimit
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}
          >
            <Star size={12} fill="currentColor" />
            <span>
              Destaques na Home: {featuredCount}/{HOME_FEATURED_LIMIT}
            </span>
            {isOverLimit && (
              <span className="text-amber-400/80">
                — apenas os 3 primeiros aparecem
              </span>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreateModal}
          className="relative z-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all border border-indigo-400/30 shrink-0"
        >
          <Plus size={18} /> Novo Projeto
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
                <th className="px-6 py-4">Projeto</th>
                <th className="px-6 py-4">Tecnologias</th>
                <th className="px-6 py-4 text-center">Destaque</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]/60">
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
                      className="group hover:bg-[var(--color-background)]/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[var(--color-foreground)] group-hover:text-indigo-400 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-xs font-mono text-[var(--color-muted)] mt-0.5">
                          /{p.slug}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.technologies && p.technologies.length > 0 ? (
                            p.technologies.map((tech) => (
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
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleFeatured(p)}
                          className={`p-2 rounded-xl border transition-all ${
                            p.featured
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

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePublish(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            p.published
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
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

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ReorderButtons
                            onMoveUp={() => reorder(projects, index, "up")}
                            onMoveDown={() => reorder(projects, index, "down")}
                            canMoveUp={index > 0}
                            canMoveDown={index < projects.length - 1}
                            disabled={reordering}
                          />

                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl text-[var(--color-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(p)}
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

      {/* Modal */}
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
                    {editingProject ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    {editingProject ? "Editar Projeto" : "Novo Projeto"}
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
                id="project-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Imagem de Capa
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="relative aspect-[16/10] w-full sm:w-48 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 overflow-hidden flex items-center justify-center">
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
                      <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-indigo-500 cursor-pointer transition">
                        {uploadingCover ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin text-indigo-400"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm font-mono text-[var(--color-foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Descrição Curta
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Conteúdo Detalhado
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Tecnologias (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Tailwind CSS"
                    value={technologiesInput}
                    onChange={(e) => setTechnologiesInput(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      GitHub (URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Demo / Live (URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
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

                  <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-[var(--color-foreground)]">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600"
                    />
                    Destacar na Home
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
                  form="project-form"
                  disabled={saving || uploadingCover}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50"
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
