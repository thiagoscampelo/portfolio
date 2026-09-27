/**
 * AdminProfile — Configurações de perfil + textos editáveis (rota `/perfil`).
 *
 * Estrutura em 3 abas:
 * 1. **Informações Pessoais** — dados básicos do profissional: nome, cargo,
 *    bio, e-mail, localização, avatar, CV, contexto (fuso, resposta,
 *    idiomas) e interesses.
 * 2. **Textos da Home** — overrides para textos da Home (hero, sobre, CTA
 *    de contato). Salva em `profiles` (colunas `hero_title`, etc).
 * 3. **Textos de Páginas** — textos por seção (Home, /projetos,
 *    /experiencia, /sobre, /contato, 404, Footer). Salva em `site_content`
 *    (tabela key/value).
 *
 * Fontes de dados:
 * - `useProfile()`     → dados de `profiles`.
 * - `useSiteContent()` → mapa chave/valor de `site_content`.
 *
 * Aba 1 — Informações Pessoais:
 * - Destaque visual para o toggle "Disponível para projetos" (controla o
 *   badge verde do Header público).
 * - Upload de avatar e currículo via `uploadFile()`.
 * - `handleSubmit` faz `update` em `profiles` (ou `insert` se não existir).
 * - `refetch()` após salvar para revalidar `useProfile` em todos os
 *   consumidores (Header, Footer, etc).
 *
 * Aba 2 — Textos da Home:
 * - Mesmo formulário que a aba 1, mas salva só os campos de texto.
 * - Não valida `name`/`role` como obrigatórios (não são relevantes aqui).
 *
 * Aba 3 — Textos de Páginas:
 * - Submit chama `handleSavePageTexts()` em vez de atualizar `profiles`.
 * - `pageTexts` é populado uma única vez via `hasPopulatedTextsRef`
 *   (useRef). Sem isso, editar um campo faria o `useEffect` sobrescrever
 *   com o valor original do banco.
 * - O `upsert` em `site_content` envia todas as chaves de uma vez.
 * - `setPageText(key, value)` faz merge incremental para preservar
 *   edições locais em outros campos.
 *
 * Detalhe sobre o botão de submit:
 * - O texto muda conforme a aba ativa: "Salvar Perfil" / "Salvar Textos
 *   da Home" / "Salvar Textos das Páginas". Isso elimina ambiguidade
 *   sobre o que está sendo salvo.
 *
 * Componente helper `PageTextInput`:
 * - Encapsula label + input/textarea + hint.
 * - Reduz a duplicação do JSX na aba 3 (são ~20 campos).
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Camera,
  Save,
  Upload,
  Loader2,
  FileText,
  Type,
  Layout,
  Trash2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useProfile } from "../../../hooks/useProfile";
import { useSiteContent } from "../../../hooks/useSiteContent";
import { deleteFile, uploadFile } from "../../../lib/upload";
import { useToast } from "../../../hooks/useToast";

export default function AdminProfile() {
  const { success, error: toastError } = useToast();
  const { profile, loading, refetch } = useProfile();
  const { content: siteContent } = useSiteContent();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "content" | "pages">(
    "general",
  );

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [available, setAvailable] = useState(true);
  const [timezone, setTimezone] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [interestsInput, setInterestsInput] = useState("");

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutPhilosophy, setAboutPhilosophy] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [contactSubtitle, setContactSubtitle] = useState("");

  const [pageTexts, setPageTexts] = useState<Record<string, string>>({});

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [persistedAvatarUrl, setPersistedAvatarUrl] = useState("");
  const [persistedResumeUrl, setPersistedResumeUrl] = useState("");

  // Guarda se os textos de página já foram populados uma vez.
  // Usa ref (não state) para não re-disparar o efeito a cada edição
  // do usuário — só queremos popular uma vez, quando siteContent chega.
  const hasPopulatedTextsRef = useRef(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setRole(profile.role || "");
      setBio(profile.bio || "");
      setEmail(profile.email || "");
      setLocation(profile.location || "");
      setAvatarUrl(profile.avatarUrl || "");
      setPersistedAvatarUrl(profile.avatarUrl || "");
      setResumeUrl(profile.resumeUrl || "");
      setPersistedResumeUrl(profile.resumeUrl || "");

      setAvailable(profile.available ?? true);
      setTimezone(profile.timezone || "");
      setResponseTime(profile.responseTime || "");
      setLanguagesInput(profile.languages?.join(", ") || "");
      setInterestsInput(profile.interests?.join(", ") || "");

      setHeroTitle(profile.heroTitle || "");
      setHeroSubtitle(profile.heroSubtitle || "");
      setAboutTitle(profile.aboutTitle || "");
      setAboutPhilosophy(profile.aboutPhilosophy || "");
      setContactTitle(profile.contactTitle || "");
      setContactSubtitle(profile.contactSubtitle || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!hasPopulatedTextsRef.current && Object.keys(siteContent).length > 0) {
      setPageTexts({ ...siteContent });
      hasPopulatedTextsRef.current = true;
    }
  }, [siteContent]);

  function setPageText(key: string, value: string) {
    setPageTexts((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const publicUrl = await uploadFile(file, "avatars");
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      toastError(err.message || "Erro ao enviar a imagem do avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingResume(true);
      const publicUrl = await uploadFile(file, "resumes");
      setResumeUrl(publicUrl);
    } catch (err: any) {
      toastError(err.message || "Erro ao enviar o currículo.");
    } finally {
      setUploadingResume(false);
    }
  }

  async function handleSavePageTexts() {
    setSaving(true);
    try {
      const updates = Object.entries(pageTexts).map(([key, value]) => ({
        key,
        value: value ?? "",
        updated_at: new Date().toISOString(),
      }));

      if (updates.length > 0) {
        const { error } = await supabase.from("site_content").upsert(updates);
        if (error) throw error;
      }

      success("Textos das páginas atualizados.");
    } catch (err: any) {
      toastError("Erro ao salvar textos: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (activeTab === "pages") {
      return handleSavePageTexts();
    }

    setSaving(true);

    const languagesArray = languagesInput
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const interestsArray = interestsInput
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const profileData = {
      name,
      role,
      bio,
      email,
      location: location || null,
      avatar_url: avatarUrl || null,
      resume_url: resumeUrl || null,

      available,
      timezone: timezone || null,
      response_time: responseTime || null,
      languages: languagesArray,
      interests: interestsArray,

      hero_title: heroTitle || null,
      hero_subtitle: heroSubtitle || null,
      about_title: aboutTitle || null,
      about_philosophy: aboutPhilosophy || null,
      contact_title: contactTitle || null,
      contact_subtitle: contactSubtitle || null,

      updated_at: new Date().toISOString(),
    };

    try {
      if (profile?.id) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert([profileData]);
        if (error) throw error;
      }

      if (persistedAvatarUrl && persistedAvatarUrl !== avatarUrl) {
        await deleteFile(persistedAvatarUrl);
      }
      if (persistedResumeUrl && persistedResumeUrl !== resumeUrl) {
        await deleteFile(persistedResumeUrl);
      }

      await refetch();
      success("Perfil atualizado.");
    } catch (err: any) {
      toastError("Erro ao salvar o perfil: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-xl shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1">
            <User size={14} className="text-indigo-400" />
            <span>Configurações</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
            Perfil &amp; Conteúdo
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Gerencie suas informações pessoais, disponibilidade e chamadas de
            texto do portfólio.
          </p>
        </div>

        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)]/60 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === "general"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]/50"
          }`}
        >
          <User size={15} /> Informações Pessoais
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === "content"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]/50"
          }`}
        >
          <Type size={15} /> Textos da Home
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pages")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === "pages"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]/50"
          }`}
        >
          <Layout size={15} /> Textos de Páginas
        </button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/30 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
      >
        {loading ? (
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-10 bg-[var(--color-border)]/40 rounded-xl" />
            <div className="h-24 bg-[var(--color-border)]/40 rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* ═══════════ ABA 1 — INFORMAÇÕES PESSOAIS ═══════════ */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-6">
                {/* Disponibilidade */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">
                      Disponibilidade para projetos
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Exibe o indicador verde no Header do site público.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={available}
                    onClick={() => setAvailable((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                      available ? "bg-emerald-500" : "bg-zinc-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        available ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Uploads */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-[var(--color-border)]/60">
                  <div className="relative group shrink-0">
                    <div className="h-20 w-20 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center overflow-hidden shadow-inner relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name || "Avatar"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera
                          size={28}
                          className="text-[var(--color-muted)]"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                        Foto de Avatar
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-indigo-500 cursor-pointer transition">
                          {uploadingAvatar ? (
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
                                {avatarUrl
                                  ? "Substituir foto"
                                  : "Escolher foto"}
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            disabled={uploadingAvatar}
                            className="hidden"
                          />
                        </label>

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl("")}
                            className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition shrink-0"
                            title="Remover foto"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                        Currículo em PDF
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-indigo-500 cursor-pointer transition">
                          {uploadingResume ? (
                            <>
                              <Loader2
                                size={16}
                                className="animate-spin text-indigo-400"
                              />
                              <span>Carregando...</span>
                            </>
                          ) : (
                            <>
                              <FileText size={16} />
                              <span>
                                {resumeUrl ? "Substituir PDF" : "Escolher PDF"}
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeChange}
                            disabled={uploadingResume}
                            className="hidden"
                          />
                        </label>

                        {resumeUrl && (
                          <button
                            type="button"
                            onClick={() => setResumeUrl("")}
                            className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition shrink-0"
                            title="Remover currículo"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nome + Cargo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Cargo / Título Profissional
                    </label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Email + Localização */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      E-mail de Contato
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 pl-10 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                      />
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Localização
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 pl-10 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                      />
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Biografia Curta (Apresentação Básica)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Contexto */}
                <div className="pt-6 border-t border-[var(--color-border)]/60 flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Layout size={14} /> Contexto profissional
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                        Fuso Horário
                      </label>
                      <input
                        type="text"
                        placeholder="UTC-3 · Brasil"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                        Tempo Médio de Resposta
                      </label>
                      <input
                        type="text"
                        placeholder="~24h úteis"
                        value={responseTime}
                        onChange={(e) => setResponseTime(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Idiomas (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      placeholder="Português, Inglês"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Interesses */}
                <div className="pt-6 border-t border-[var(--color-border)]/60">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Interesses (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Open source, Design de produto, Performance web"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Aparecem na seção de áreas de interesse da página Sobre.
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════ ABA 2 — TEXTOS DA HOME ═══════════ */}
            {activeTab === "content" && (
              <div className="flex flex-col gap-6">
                <div className="pb-6 border-b border-[var(--color-border)]/60 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Layout size={16} /> Seção Hero (Apresentação Principal)
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Título Principal (Hero)
                    </label>
                    <input
                      type="text"
                      placeholder="Construindo software com propósito e atenção aos detalhes."
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Subtítulo / Descrição de Destaque
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Especializado em desenvolvimento de aplicações modernas..."
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="pb-6 border-b border-[var(--color-border)]/60 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Layout size={16} /> Seção &ldquo;Sobre&rdquo;
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Título da Seção Sobre
                    </label>
                    <input
                      type="text"
                      placeholder="Um pouco sobre mim."
                      value={aboutTitle}
                      onChange={(e) => setAboutTitle(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Filosofia / Parágrafo Complementar
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Com experiência na construção de aplicações do zero..."
                      value={aboutPhilosophy}
                      onChange={(e) => setAboutPhilosophy(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Layout size={16} /> Seção de Contato (CTA)
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Título da Seção de Contato
                    </label>
                    <input
                      type="text"
                      placeholder="Vamos construir algo juntos?"
                      value={contactTitle}
                      onChange={(e) => setContactTitle(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                      Subtítulo do Contato
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Estou sempre aberto a discutir novas oportunidades..."
                      value={contactSubtitle}
                      onChange={(e) => setContactSubtitle(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ ABA 3 — TEXTOS DE PÁGINAS ═══════════ */}
            {activeTab === "pages" && (
              <div className="flex flex-col gap-8">
                {/* HOME */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Home
                  </h3>

                  <PageTextInput
                    label='Título — seção "Projetos"'
                    value={pageTexts.home_projects_title || ""}
                    onChange={(v) => setPageText("home_projects_title", v)}
                    placeholder="Projetos selecionados."
                  />

                  <PageTextInput
                    label='Título — seção "Experiência"'
                    value={pageTexts.home_experience_title || ""}
                    onChange={(v) => setPageText("home_experience_title", v)}
                    placeholder="Minha trajetória."
                  />

                  <PageTextInput
                    label='Descrição — seção "Experiência"'
                    value={pageTexts.home_experience_description || ""}
                    onChange={(v) =>
                      setPageText("home_experience_description", v)
                    }
                    multiline
                    placeholder="Um resumo do meu percurso profissional..."
                  />
                </div>

                <div className="border-t border-[var(--color-border)]/60" />

                {/* PROJETOS */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Página /projetos
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PageTextInput
                      label="Eyebrow"
                      value={pageTexts.projects_hero_eyebrow || ""}
                      onChange={(v) => setPageText("projects_hero_eyebrow", v)}
                      placeholder="Portfólio"
                    />
                    <PageTextInput
                      label="Título"
                      value={pageTexts.projects_hero_title || ""}
                      onChange={(v) => setPageText("projects_hero_title", v)}
                      placeholder="Projetos selecionados."
                    />
                  </div>

                  <PageTextInput
                    label="Subtítulo"
                    value={pageTexts.projects_hero_subtitle || ""}
                    onChange={(v) => setPageText("projects_hero_subtitle", v)}
                    multiline
                    placeholder="Uma coleção de aplicações e soluções..."
                  />
                </div>

                <div className="border-t border-[var(--color-border)]/60" />

                {/* EXPERIÊNCIA */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Página /experiencia
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PageTextInput
                      label="Eyebrow"
                      value={pageTexts.experience_hero_eyebrow || ""}
                      onChange={(v) =>
                        setPageText("experience_hero_eyebrow", v)
                      }
                      placeholder="Trajetória"
                    />
                    <PageTextInput
                      label="Título"
                      value={pageTexts.experience_hero_title || ""}
                      onChange={(v) => setPageText("experience_hero_title", v)}
                      placeholder="Experiência profissional."
                    />
                  </div>

                  <PageTextInput
                    label="Subtítulo"
                    value={pageTexts.experience_hero_subtitle || ""}
                    onChange={(v) => setPageText("experience_hero_subtitle", v)}
                    multiline
                    placeholder="Um panorama do meu percurso..."
                  />
                </div>

                <div className="border-t border-[var(--color-border)]/60" />

                {/* SOBRE */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Página /sobre
                  </h3>

                  {/* Filosofia */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 01 — Filosofia
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.about_philosophy_label || ""}
                        onChange={(v) =>
                          setPageText("about_philosophy_label", v)
                        }
                        placeholder="Filosofia"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.about_philosophy_title || ""}
                        onChange={(v) =>
                          setPageText("about_philosophy_title", v)
                        }
                        placeholder="Como eu penso."
                      />
                    </div>
                  </div>

                  {/* Trajetória */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 02 — Trajetória
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.about_trajectory_label || ""}
                        onChange={(v) =>
                          setPageText("about_trajectory_label", v)
                        }
                        placeholder="Trajetória"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.about_trajectory_title || ""}
                        onChange={(v) =>
                          setPageText("about_trajectory_title", v)
                        }
                        placeholder="Experiência profissional."
                      />
                    </div>
                    <PageTextInput
                      label="Descrição"
                      value={pageTexts.about_trajectory_description || ""}
                      onChange={(v) =>
                        setPageText("about_trajectory_description", v)
                      }
                      multiline
                      placeholder="Um panorama do meu percurso..."
                    />
                  </div>

                  {/* Formação */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 03 — Formação
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.about_education_label || ""}
                        onChange={(v) =>
                          setPageText("about_education_label", v)
                        }
                        placeholder="Formação"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.about_education_title || ""}
                        onChange={(v) =>
                          setPageText("about_education_title", v)
                        }
                        placeholder="Base acadêmica."
                      />
                    </div>
                    <PageTextInput
                      label="Descrição"
                      value={pageTexts.about_education_description || ""}
                      onChange={(v) =>
                        setPageText("about_education_description", v)
                      }
                      multiline
                      placeholder="Formação formal que sustenta a prática profissional."
                    />
                  </div>

                  {/* Ferramentas */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 04 — Ferramentas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.about_tools_label || ""}
                        onChange={(v) => setPageText("about_tools_label", v)}
                        placeholder="Ferramentas"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.about_tools_title || ""}
                        onChange={(v) => setPageText("about_tools_title", v)}
                        placeholder="Tecnologias & habilidades."
                      />
                    </div>
                  </div>

                  {/* Áreas de interesse */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 05 — Áreas de interesse
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.about_interests_label || ""}
                        onChange={(v) =>
                          setPageText("about_interests_label", v)
                        }
                        placeholder="Áreas de interesse"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.about_interests_title || ""}
                        onChange={(v) =>
                          setPageText("about_interests_title", v)
                        }
                        placeholder="O que me move profissionalmente."
                      />
                    </div>
                  </div>

                  {/* CTA final */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      CTA final
                    </h4>
                    <PageTextInput
                      label="Título"
                      value={pageTexts.about_cta_title || ""}
                      onChange={(v) => setPageText("about_cta_title", v)}
                      placeholder="Quer conhecer meu trabalho de perto?"
                    />
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)]/60" />

                {/* CONTATO */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Página /contato
                  </h3>

                  {/* Hero */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Hero
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Eyebrow"
                        value={pageTexts.contact_hero_eyebrow || ""}
                        onChange={(v) => setPageText("contact_hero_eyebrow", v)}
                        placeholder="Contato"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.contact_hero_title || ""}
                        onChange={(v) => setPageText("contact_hero_title", v)}
                        placeholder="Vamos conversar?"
                      />
                    </div>
                    <PageTextInput
                      label="Subtítulo"
                      value={pageTexts.contact_hero_subtitle || ""}
                      onChange={(v) => setPageText("contact_hero_subtitle", v)}
                      multiline
                      placeholder="Estou disponível para novas oportunidades..."
                    />
                  </div>

                  {/* Canais */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 01 — Canais
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.contact_canals_label || ""}
                        onChange={(v) => setPageText("contact_canals_label", v)}
                        placeholder="Canais"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.contact_canals_title || ""}
                        onChange={(v) => setPageText("contact_canals_title", v)}
                        placeholder="Como me encontrar."
                      />
                    </div>
                  </div>

                  {/* Colaborações */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 02 — Colaborações
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.contact_collab_label || ""}
                        onChange={(v) => setPageText("contact_collab_label", v)}
                        placeholder="Colaborações"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.contact_collab_title || ""}
                        onChange={(v) => setPageText("contact_collab_title", v)}
                        placeholder="Como podemos trabalhar juntos."
                      />
                    </div>
                    <PageTextInput
                      label="Descrição"
                      value={pageTexts.contact_collab_description || ""}
                      onChange={(v) =>
                        setPageText("contact_collab_description", v)
                      }
                      multiline
                      placeholder="Formatos de colaboração que costumo aceitar..."
                    />
                  </div>

                  {/* Contexto */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Seção 03 — Contexto
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PageTextInput
                        label="Label"
                        value={pageTexts.contact_context_label || ""}
                        onChange={(v) =>
                          setPageText("contact_context_label", v)
                        }
                        placeholder="Contexto"
                      />
                      <PageTextInput
                        label="Título"
                        value={pageTexts.contact_context_title || ""}
                        onChange={(v) =>
                          setPageText("contact_context_title", v)
                        }
                        placeholder="Quando e onde."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)]/60" />

                {/* 404 */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Página 404
                  </h3>

                  <PageTextInput
                    label="Label superior"
                    value={pageTexts.notfound_label || ""}
                    onChange={(v) => setPageText("notfound_label", v)}
                    placeholder="404 — Página não encontrada"
                  />

                  <PageTextInput
                    label="Descrição"
                    value={pageTexts.notfound_description || ""}
                    onChange={(v) => setPageText("notfound_description", v)}
                    multiline
                    placeholder="A página que você está procurando não existe..."
                  />

                  <PageTextInput
                    label="Texto do botão"
                    value={pageTexts.notfound_button || ""}
                    onChange={(v) => setPageText("notfound_button", v)}
                    placeholder="Voltar para a Home"
                  />
                </div>

                <div className="border-t border-[var(--color-border)]/60" />

                {/* FOOTER */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Footer
                  </h3>

                  <PageTextInput
                    label="Tagline (concatenada ao cargo)"
                    value={pageTexts.footer_tagline || ""}
                    onChange={(v) => setPageText("footer_tagline", v)}
                    multiline
                    hint="Exibida como: [cargo] [tagline]"
                    placeholder="focado na construção de aplicações web modernas..."
                  />
                </div>
              </div>
            )}

            {/* Botão salvar */}
            <div className="flex justify-end pt-4 border-t border-[var(--color-border)]/60">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving || uploadingAvatar || uploadingResume}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                <Save size={18} />
                {saving
                  ? "Salvando..."
                  : activeTab === "pages"
                    ? "Salvar Textos das Páginas"
                    : activeTab === "content"
                      ? "Salvar Textos da Home"
                      : "Salvar Perfil"}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ─────────── Helper component ─────────── */

interface PageTextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
}

function PageTextInput({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  hint,
}: PageTextInputProps) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 p-4 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition"
        />
      )}
      {hint && <p className="mt-2 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}
