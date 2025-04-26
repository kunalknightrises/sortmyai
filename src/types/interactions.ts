import { User } from './index';

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  username?: string;
  userAvatar?: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  username?: string;
  userAvatar?: string;
  likes?: number;
  parentId?: string; // For replies to comments
}

export interface LikeWithUser extends Like {
  user: User;
}

export interface CommentWithUser extends Comment {
  user: User;
  replies?: CommentWithUser[];
}

export interface InteractionStats {
  likes: number;
  comments: number;
  userHasLiked: boolean;
}
