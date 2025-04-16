
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
  xpReward?: number;
  unlocked?: boolean;
  unlockedAt?: string;
  color?: string;
  animation?: 'pulse' | 'glow' | 'spin' | 'bounce';
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

export interface LevelProgress {
  currentXP: number;
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  percentageComplete: number;
  estimatedTimeToNextLevel?: string;
}

export interface Notification {
  id: string;
  type: 'badge_unlocked' | 'level_up' | 'streak_milestone' | 'achievement' | 'system';
  title: string;
  message: string;
  icon?: string;
  color?: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  nextMilestone: number;
  streakHistory: {
    date: string;
    active: boolean;
  }[];
}
