
export interface User {
  id: string;
  uid: string;
  email: string | undefined;
  username?: string;
  is_premium?: boolean;
  claude_enabled?: boolean;
  created_at?: string;
  avatar_url?: string;
  role?: 'admin' | 'intern' | 'basic';
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
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video' | 'audio';
  tools_used: string[];
  categories: string[];
  likes: number;
  views: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: string;
  userId: string;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  usage_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  rating: number;
  price_tier: 'free' | 'freemium' | 'paid' | 'subscription';
  notes: string;
  created_at: string;
  updated_at: string;
}

export * from './gamification';
