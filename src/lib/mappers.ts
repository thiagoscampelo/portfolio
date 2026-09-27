/**
 * mappers — Conversão entre o formato do banco e o formato do frontend.
 *
 * O Supabase usa **snake_case** (`avatar_url`, `created_at`, `resume_url`).
 * O TypeScript do projeto usa **camelCase** (`avatarUrl`, `createdAt`,
 * `resumeUrl`). Esta camada faz a tradução em um único lugar.
 *
 * Cada mapper:
 * - Aceita uma `Row` tipada vinda do `database.types.ts` — sem `any`.
 * - Retorna uma interface do domínio (`Profile`, `Project`, etc).
 * - Normaliza campos opcionais (`?? false`, `?? 0`, `|| []`) para que
 *   o frontend nunca precise lidar com `null` inesperado.
 *
 * Nota sobre `mapSocialLink`:
 * - A URL passa por `normalizeSocialUrl()` para garantir formato correto
 *   por plataforma (WhatsApp → wa.me, Telegram → t.me, demais → https://).
 *   Isso protege contra dados legados que possam estar mal formatados.
 */
import type { Database } from "./database.types";
import { normalizeSocialUrl } from "./socialUrl";
import type {
  Collaboration,
  Education,
  Experience,
  Profile,
  Project,
  Skill,
  SocialLink,
} from "../types";

/* ─────────── Tipos derivados do banco ─────────── */

type Tables = Database["public"]["Tables"];

type ProfileRow = Tables["profiles"]["Row"];
type ProjectRow = Tables["projects"]["Row"];
type ExperienceRow = Tables["experiences"]["Row"];
type SkillRow = Tables["skills"]["Row"];
type SocialLinkRow = Tables["social_links"]["Row"];
type CollaborationRow = Tables["collaborations"]["Row"];
type EducationRow = Tables["education"]["Row"];

/* ─────────── Mappers ─────────── */

export function mapProfile(data: ProfileRow): Profile {
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    bio: data.bio,
    avatarUrl: data.avatar_url,
    location: data.location,
    email: data.email,
    resumeUrl: data.resume_url,
    available: data.available ?? true,

    heroTitle: data.hero_title,
    heroSubtitle: data.hero_subtitle,
    aboutTitle: data.about_title,
    aboutPhilosophy: data.about_philosophy,
    contactTitle: data.contact_title,
    contactSubtitle: data.contact_subtitle,

    timezone: data.timezone,
    responseTime: data.response_time,
    languages: data.languages || [],
    interests: data.interests || [],

    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
  };
}

export function mapProject(data: ProjectRow): Project {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    content: data.content,
    coverImage: data.cover_image,
    githubUrl: data.github_url,
    demoUrl: data.demo_url,
    featured: data.featured ?? false,
    published: data.published ?? false,
    order: data.order ?? 0,
    technologies: data.technologies || [],
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
  };
}

export function mapExperience(data: ExperienceRow): Experience {
  return {
    id: data.id,
    number: data.number,
    period: data.period,
    role: data.role,
    company: data.company,
    description: data.description,
    technologies: data.technologies || [],
    published: data.published ?? false,
    order: data.order ?? 0,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
  };
}

export function mapSkill(data: SkillRow): Skill {
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    published: data.published ?? false,
    order: data.order ?? 0,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
  };
}

export function mapSocialLink(data: SocialLinkRow): SocialLink {
  return {
    id: data.id,
    platform: data.platform,
    url: normalizeSocialUrl(data.platform, data.url || ""),
    label: data.label,
    published: data.published ?? false,
    order: data.order ?? 0,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
  };
}

export function mapCollaboration(data: CollaborationRow): Collaboration {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    published: data.published ?? false,
    order: data.order ?? 0,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
  };
}

export function mapEducation(data: EducationRow): Education {
  return {
    id: data.id,
    type: (data.type as Education["type"]) || "degree",
    institution: data.institution,
    course: data.course,
    description: data.description,
    period: data.period,
    published: data.published ?? false,
    order: data.order ?? 0,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
  };
}
