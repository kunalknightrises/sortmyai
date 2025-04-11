import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PortfolioItem, User } from '@/types';

// Mock data for development - would be replaced with real data in production
const mockUsers = [
  {
    id: 'user123',
    uid: 'user123',
    email: 'creator@example.com',
    username: 'AICreator',
    avatar_url: 'https://ui-avatars.com/api/?name=AI+Creator&background=0D8ABC&color=fff',
    is_premium: true,
    claude_enabled: true,
    created_at: '2023-01-15T08:30:00Z',
    xp: 450,
    level: 5,
    streak_days: 12,
    last_login: '2023-05-10T14:25:00Z',
    badges: ['badge1', 'badge2', 'badge3']
  }
];

const mockPortfolioItems: PortfolioItem[] = [
  {
    id: 'port1',
    userId: 'user123',
    title: 'AI-Generated Landscape',
    description: 'A beautiful landscape created using Stable Diffusion XL with custom prompting techniques.',
    media_url: 'https://images.unsplash.com/photo-1682686580391-615b1e32596a',
    media_type: 'image',
    tools_used: ['Stable Diffusion XL', 'Midjourney'],
    categories: ['image', 'landscape'],
    likes: 124,
    views: 350,
    is_public: true,
    created_at: '2023-03-15T09:24:00Z',
    updated_at: '2023-03-15T09:24:00Z'
  },
  {
    id: 'port2',
    userId: 'user123',
    title: 'Voice Cloning Demo',
    description: 'A demonstration of voice cloning technology using Resemble AI to replicate a famous actor\'s voice.',
    media_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    media_type: 'video',
    tools_used: ['Resemble AI', 'ElevenLabs'],
    categories: ['voice', 'cloning'],
    likes: 89,
    views: 210,
    is_public: true,
    created_at: '2023-04-01T11:12:00Z',
    updated_at: '2023-04-01T11:12:00Z'
  },
  {
    id: 'port3',
    userId: 'user123',
    title: 'AI Music Composition',
    description: 'An original music piece composed entirely by AI using Amper Music and enhanced with human touch.',
    media_url: 'https://example.com/ai-music.mp3',
    media_type: 'audio',
    tools_used: ['Amper Music', 'Boomy'],
    categories: ['music', 'composition'],
    likes: 67,
    views: 180,
    is_public: false,
    created_at: '2023-04-20T16:48:00Z',
    updated_at: '2023-04-20T16:48:00Z'
  }
];

export const fetchUserProfile = async (username: string): Promise<User> => {
  try {
    // In production, we would query Firestore
    // const usersRef = collection(db, 'users');
    // const q = query(usersRef, where('username', '==', username));
    // const querySnapshot = await getDocs(q);
    
    // if (querySnapshot.empty) {
    //   throw new Error('User not found');
    // }
    
    // return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as User;

    // For development, return mock user
    const user = mockUsers.find(u => u.username === username);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const fetchPortfolioItems = async (userId: string): Promise<PortfolioItem[]> => {
  try {
    // In production, we would query Firestore
    // const portfolioRef = collection(db, 'portfolio');
    // const q = query(portfolioRef, where('userId', '==', userId));
    // const querySnapshot = await getDocs(q);
    
    // return querySnapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data()
    // })) as PortfolioItem[];

    // For development, return mock items
    return mockPortfolioItems.filter(item => item.userId === userId);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw error;
  }
};
