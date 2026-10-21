/**
 * projectLinks — Metadados compartilhados dos tipos de link de projeto.
 *
 * Cada tipo tem um label padrão (usado quando o link não tem um custom)
 * e um ícone Lucide. Consumido por:
 * - AdminProjects (dropdown de tipo ao criar/editar um link)
 * - ProjectDetails (renderização dos links na página do projeto)
 *
 * Regra de "privado": quando o link não tem URL, mostramos apenas o
 * badge com o ícone + label — sem link clicável. Serve para sinalizar
 * que o recurso existe mas não é público (ex: repositório privado).
 */
import {
  Code2,
  Server,
  ExternalLink,
  FileText,
  Palette,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProjectLinkType } from "../types";

export interface ProjectLinkMeta {
  value: ProjectLinkType;
  label: string;
  icon: LucideIcon;
}

export const PROJECT_LINK_TYPES: ProjectLinkMeta[] = [
  { value: "frontend", label: "Frontend", icon: Code2 },
  { value: "backend", label: "Backend", icon: Server },
  { value: "demo", label: "Demo", icon: ExternalLink },
  { value: "docs", label: "Documentação", icon: FileText },
  { value: "figma", label: "Design / Figma", icon: Palette },
  { value: "video", label: "Vídeo", icon: Video },
  { value: "other", label: "Outro", icon: LinkIcon },
];

export function getProjectLinkMeta(type: ProjectLinkType): ProjectLinkMeta {
  return (
    PROJECT_LINK_TYPES.find((t) => t.value === type) ?? PROJECT_LINK_TYPES[6]
  );
}