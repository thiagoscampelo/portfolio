/**
 * AdminSocialLinks — CRUD de links sociais.
 *
 * Recursos:
 * - PlatformSelect customizado (dropdown com ícones em vez de `<select>`)
 * - Preview em tempo real da URL normalizada
 * - Auto-detecção de plataforma quando o usuário cola uma URL reconhecida
 * - Toggle de publicação
 * - Reordenação via ↑↓
 *
 * Normalização:
 * - WhatsApp: só dígitos → `https://wa.me/<digits>`
 * - Telegram: @handle ou t.me/... → `https://t.me/<handle>`
 * - Demais: adiciona `https://` se ausente
 * - `mailto` NÃO está em COMMON_PLATFORMS — o e-mail vem do perfil
 *
 * Estado da tabela:
 * - Desktop: 4 colunas
 * - Mobile: scroll horizontal via `overflow-x-auto` + `min-w-[640px]`
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Share2,
  X,
  Sparkles,
} from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { supabase } from "../../../lib/supabase";
import { mapSocialLink } from "../../../lib/mappers";
import {
  normalizeSocialUrl,
  detectPlatformFromUrl,
} from "../../../lib/socialUrl";
import { useReorder } from "../../../hooks/useReorder";
import ReorderButtons from "../../../components/admin/ReorderButtons";
import PlatformSelect from "../../../components/admin/PlatformSelect";
import type { SocialLink } from "../../../types";
import { useConfirm } from "../../../hooks/useConfirm";
import { useToast } from "../../../hooks/useToast";

const COMMON_PLATFORMS = [
  "github",
  "linkedin",
  "twitter",
  "instagram",
  "youtube",
  "bluesky",
  "whatsapp",
  "telegram",
  "discord",
];

export default function AdminSocialLinks() {
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

  const [platform, setPlatform] = useState("github");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [published, setPublished] = useState(true);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise((r) => setTimeout(r, 350 - elapsed));
      }

      if (data) setLinks(data.map(mapSocialLink));
    } catch (err: any) {
      toastError("Erro ao carregar links: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const { reorder, reordering } = useReorder<SocialLink>(
    "social_links",
    fetchLinks,
  );

  function handleUrlChange(value: string) {
    setUrl(value);

    if (!editingLink) {
      const detected = detectPlatformFromUrl(value);
      // "mailto" foi removido do select — o e-mail vem sempre do perfil.
      if (detected && detected !== "mailto" && detected !== platform) {
        setPlatform(detected);
      }
    }
  }

  function handleOpenCreate() {
    setEditingLink(null);
    setPlatform("github");
    setUrl("");
    setLabel("");
    setPublished(true);
    setIsModalOpen(true);
  }

  function handleOpenEdit(link: SocialLink) {
    setEditingLink(link);
    setPlatform(link.platform);
    setUrl(link.url);
    setLabel(link.label || "");
    setPublished(link.published);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const normalizedUrl = normalizeSocialUrl(platform, url);

    if (!normalizedUrl) {
      toastError("URL inválida para a plataforma selecionada.");
      setSaving(false);
      return;
    }

    const linkData = {
      platform,
      url: normalizedUrl,
      label: label || null,
      published,
    };

    try {
      if (editingLink) {
        const { error } = await supabase
          .from("social_links")
          .update(linkData)
          .eq("id", editingLink.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("social_links")
          .insert([linkData]);
        if (error) throw error;
      }
      success(editingLink ? "Link atualizado." : "Link criado.");
      setIsModalOpen(false);
      fetchLinks();
    } catch (err: any) {
      toastError("Erro ao salvar link: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(link: SocialLink) {
    try {
      const { error } = await supabase
        .from("social_links")
        .update({ published: !link.published })
        .eq("id", link.id);
      if (error) throw error;
      success(link.published ? "Link despublicado." : "Link publicado.");
      fetchLinks();
    } catch (err: any) {
      toastError("Erro ao atualizar status: " + err.message);
    }
  }

  async function handleDelete(link: SocialLink) {
    const ok = await confirm({
      title: "Excluir link",
      message: `Tem certeza que deseja excluir "${link.label || link.platform}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "danger",
    });

    if (!ok) return;

    try {
      const { error } = await supabase
        .from("social_links")
        .delete()
        .eq("id", link.id);
      if (error) throw error;
      success("Link excluído.");
      fetchLinks();
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
            <Share2 size={14} className="text-indigo-400" />
            <span>Presença Online</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
            Links Sociais
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Ícones exibidos no Footer e na página de Contato.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="relative z-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all border border-indigo-400/30"
        >
          <Plus size={18} /> Novo Link
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
          <table className="w-full text-left text-sm border-collapse min-w-[640px]">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)]/60 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">
              <tr>
                <th className="px-6 py-4">Plataforma</th>
                <th className="px-6 py-4">URL</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]/60">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 bg-[var(--color-border)]/60 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-56 bg-[var(--color-border)]/50 rounded" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="h-6 w-24 bg-[var(--color-border)]/50 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="h-7 w-16 bg-[var(--color-border)]/50 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : links.length === 0 ? (
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
                        Nenhum link cadastrado
                      </p>
                      <p className="text-xs">
                        Clique em "Novo Link" para adicionar.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {links.map((link, index) => (
                    <motion.tr
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group hover:bg-[var(--color-background)]/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[var(--color-foreground)] group-hover:text-indigo-400 transition-colors">
                          {link.label || link.platform}
                        </p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5 font-mono">
                          {link.platform}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-xs text-[var(--color-muted)] max-w-xs truncate">
                        {link.url}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePublish(link)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            link.published
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          }`}
                        >
                          {link.published ? (
                            <Eye size={13} />
                          ) : (
                            <EyeOff size={13} />
                          )}
                          {link.published ? "Publicado" : "Rascunho"}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ReorderButtons
                            onMoveUp={() => reorder(links, index, "up")}
                            onMoveDown={() => reorder(links, index, "down")}
                            canMoveUp={index > 0}
                            canMoveDown={index < links.length - 1}
                            disabled={reordering}
                          />

                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOpenEdit(link)}
                            className="p-2 rounded-xl text-[var(--color-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(link)}
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
              className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400 block mb-0.5">
                    {editingLink ? "Edição" : "Novo Cadastro"}
                  </span>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    {editingLink ? "Editar Link" : "Novo Link"}
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
                id="link-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Plataforma
                  </label>
                  <PlatformSelect
                    value={platform}
                    onChange={setPlatform}
                    options={COMMON_PLATFORMS}
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Define o ícone. Opções: {COMMON_PLATFORMS.join(", ")}.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    URL ou Identificador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={urlPlaceholder(platform)}
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    {urlHint(platform)}
                  </p>

                  {url.trim() && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-3 py-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                        <SocialIcon
                          as="span"
                          network={platform}
                          style={{ height: 28, width: 28 }}
                        />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-0.5">
                          Vai salvar como
                        </p>
                        <p className="text-xs font-mono text-[var(--color-foreground)] truncate">
                          {normalizeSocialUrl(platform, url)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Rótulo (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="GitHub"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Se vazio, exibe o nome da plataforma.
                  </p>
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
                  form="link-form"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Link"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── Helpers de UX do input ─────────── */

function urlPlaceholder(platform: string): string {
  switch (platform) {
    case "whatsapp":
      return "5511999999999";
    case "telegram":
      return "@usuario";
    default:
      return "https://...";
  }
}

function urlHint(platform: string): string {
  switch (platform) {
    case "whatsapp":
      return "Apenas os dígitos, incluindo código do país. Ex: 5511999999999.";
    case "telegram":
      return "Apenas o @handle. O prefixo https://t.me/ é adicionado automaticamente.";
    default:
      return "Cole a URL completa ou apenas o domínio — https:// é adicionado automaticamente.";
  }
}
