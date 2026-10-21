export interface Profile {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string | null;
  location: string | null;
  email: string;
  resumeUrl: string | null;
  available?: boolean;

  heroTitle?: string | null;
  heroSubtitle?: string | null;
  aboutTitle?: string | null;
  aboutPhilosophy?: string | null;
  contactTitle?: string | null;
  contactSubtitle?: string | null;

  timezone?: string | null;
  responseTime?: string | null;
  languages?: string[] | null;

  interests?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectLinkType =
  | "frontend"
  | "backend"
  | "demo"
  | "docs"
  | "figma"
  | "video"
  | "other";

export interface ProjectLink {
  type: ProjectLinkType;
  label?: string | null;
  url?: string | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string | null;
  links: ProjectLink[];
  featured: boolean;
  published: boolean;
  technologies: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  number: string;
  period: string;
  role: string;
  company: string;
  description: string;
  technologies: string[];
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Collaboration {
  id: string;
  title: string;
  description: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type EducationType = "degree" | "technical" | "certification" | "course";

export interface Education {
  id: string;
  type: EducationType;
  institution: string;
  course: string;
  description: string | null;
  period: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
