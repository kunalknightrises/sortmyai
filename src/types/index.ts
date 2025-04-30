export interface User {
  id: string;
  uid: string;
  email: string | undefined;
  username?: string;
  is_premium?: boolean;
  claude_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  bio?: string;
  profession?: string;
  website?: string;
  role?: 'admin' | 'intern' | 'basic';
  followers_count?: number;
  following_count?: number;
  following?: string[];
  // Gamification related properties
  xp: number;
  level: number;
  streak_days: number;
  last_login: string;
  badges: string[];
  ai_knowledge?: {
    overall: number;
    categories: Record<string, number>;
  };
  onboarded?: boolean; // New field for onboarding status
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  media_url: string;
  media_urls?: string[];
  media_type: 'image' | 'video' | 'audio';
  content_type: 'post' | 'reel' | 'both'; // Type of content (post, reel, or both)
  thumbnail_url?: string; // URL for video thumbnail
  tools_used: string[];
  categories: string[];
  likes: number;
  comments?: number;
  views: number;
  project_url?: string;
  is_public: boolean;
  status: 'published' | 'draft' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  archived_at?: string;
  onClick?: () => void; // For handling click events in components
  // Author information (for display purposes)
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  category?: string;
  created_at?: string;
  user_id?: string;
}

export interface AITool {
  id: string;
  name: string;
  useCase: string;
  description: string;
  tags: string[] | string;
  pricing: string;
  excelsAt: string;
  website?: string;
  websiteLink?: string;
  logoUrl?: string;
  logoLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export * from './gamification';
