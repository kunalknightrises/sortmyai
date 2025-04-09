// User related types
export interface User {
  id: string;
  uid: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  is_premium: boolean;
  claude_enabled: boolean;
  created_at: string;
}

export interface AuthUser {
  uid: string;
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  is_premium: boolean;
  claude_enabled: boolean;
  created_at: string;
  updated_at?: string;
}

// Tool related types
export interface Tool {
  id: string;
  name: string;
  description: string;
  website_url: string;
  logo_url?: string;
  tags: string[];
  user_id: string;
  created_at: string;
}

// Portfolio related types
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video';
  tools_used: string[];
  is_public: boolean;
  likes: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type PortfolioView = 'grid' | 'list';
export type PortfolioFilter = 'all' | 'public' | 'private';

// Authentication types
export type AuthProvider = 'email' | 'google' | 'github' | 'twitter';

// UI Component Props
export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  username: string;
}

export interface ToolFormData {
  name: string;
  description: string;
  website_url: string;
  logo_url?: string;
  tags: string[];
}