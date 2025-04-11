
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

export * from './gamification';
