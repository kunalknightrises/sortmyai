import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, PortfolioItem } from '@/types';

export const fetchUserProfile = async (username: string): Promise<User> => {
  try {
    if (!username) {
      throw new Error('Username is required');
    }

    // First try getting user by username
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    // If not found by username, try by uid
    if (querySnapshot.empty) {
      const userDoc = await getDoc(doc(usersRef, username));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          id: userDoc.id,
          uid: userDoc.id,
          xp: data.xp || 0,
          level: data.level || 1,
          streak_days: data.streak_days || 0,
          last_login: data.last_login || new Date().toISOString(),
          badges: data.badges || []
        } as User;
      }
      throw new Error('User not found');
    }

    if (querySnapshot.docs.length === 0) {
      throw new Error('User not found');
    }
    
    const userData = querySnapshot.docs[0].data();
    return {
      ...userData,
      id: querySnapshot.docs[0].id,
      uid: querySnapshot.docs[0].id,
      xp: userData.xp || 0,
      level: userData.level || 1,
      streak_days: userData.streak_days || 0,
      last_login: userData.last_login || new Date().toISOString(),
      badges: userData.badges || []
    } as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const fetchPortfolioItems = async (userId: string): Promise<PortfolioItem[]> => {
  try {
    // Get items from Firebase
    const portfolioRef = collection(db, 'portfolio');
    const q = query(portfolioRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PortfolioItem[];

    // Get items from Google Drive if available
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (userData?.gdrive_portfolio_items) {
        const gdriveItems = userData.gdrive_portfolio_items as PortfolioItem[];
        items.push(...gdriveItems);
      }
    } catch (error) {
      console.warn('Could not fetch Google Drive items:', error);
    }

    return items.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw error;
  }
};
