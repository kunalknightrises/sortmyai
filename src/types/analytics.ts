// User type is imported from contexts when needed

export interface ViewEvent {
  id: string;
  userId: string | null; // Can be null for anonymous views
  userInfo?: {
    username?: string;
    avatar_url?: string;
    displayName?: string;
  };
  itemId: string;
  itemType: 'portfolio' | 'profile';
  timestamp: string;
  referrer?: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    isMobile?: boolean;
  };
}

export interface InteractionEvent {
  id: string;
  userId: string;
  userInfo: {
    username?: string;
    avatar_url?: string;
    displayName?: string;
  };
  itemId: string;
  itemType: 'portfolio' | 'profile';
  interactionType: 'like' | 'comment' | 'follow';
  timestamp: string;
  content?: string; // For comments
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueViewers: number;
  totalLikes: number;
  uniqueLikers: number;
  totalComments: number;
  uniqueCommenters: number;
  viewsOverTime: {
    date: string;
    count: number;
  }[];
  likesOverTime: {
    date: string;
    count: number;
  }[];
  commentsOverTime: {
    date: string;
    count: number;
  }[];
  topViewers: UserInteractionSummary[];
  topLikers: UserInteractionSummary[];
  topCommenters: UserInteractionSummary[];
}

export interface UserInteractionSummary {
  userId: string;
  username?: string;
  displayName?: string;
  avatar_url?: string;
  interactionCount: number;
  lastInteraction: string;
}

export interface PortfolioItemAnalytics {
  itemId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  viewsOverTime: {
    date: string;
    count: number;
  }[];
  recentViewers: UserInteractionSummary[];
  recentLikers: UserInteractionSummary[];
  recentCommenters: UserInteractionSummary[];
}

export interface ProfileAnalytics {
  userId: string;
  username: string;
  profileViews: number;
  uniqueViewers: number;
  followers: number;
  following: number;
  totalPortfolioViews: number;
  totalPortfolioLikes: number;
  totalPortfolioComments: number;
  viewsOverTime: {
    date: string;
    count: number;
  }[];
  recentViewers: UserInteractionSummary[];
  topPortfolioItems: {
    itemId: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
  }[];
}
