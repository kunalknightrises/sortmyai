
export interface Module {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  isCompleted: boolean;
  videoId?: string;
  resourceUrl?: string;
}

export interface Tier {
  id: string;
  name: string;
  isUnlocked: boolean;
  modules: Module[];
}
