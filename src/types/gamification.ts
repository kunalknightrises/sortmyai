
export interface XPActivity {
  id: string;
  name: string;
  description: string;
  xpAmount: number;
  icon: string;
}

export interface UserXP {
  userId: string;
  currentXP: number;
  level: number;
  streakDays: number;
  lastLoginDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
  category: 'achievement' | 'milestone' | 'skill' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isEarned: boolean;
  earnedDate?: string;
  requiredXP?: number;
}

export interface LeaderboardUser {
  userId: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  streakDays: number;
  badges: number;
  isPremium: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  xpReward: number;
  badgeReward?: string;
  isCompleted: boolean;
  progress: number;
  totalSteps: number;
}

export interface AIKnowledge {
  overall: number;
  categories: {
    [key: string]: number;
  };
}
