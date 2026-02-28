export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  totalLikes: number;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
}

export interface Template {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  content: string;
  isPublic: boolean;
  likesCount: number;
  createdAt: Date;
}

export interface TemplateLike {
  id: string;
  templateId: string;
  userId: string;
  createdAt: Date;
}

export interface CommunityUser {
  id: string;
  name: string;
  avatar: string | null;
  totalLikes: number;
  templatesCount: number;
}

export type ViewType = "templates" | "community" | "profile";
