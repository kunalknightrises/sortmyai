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

      if (userData?.gdrive_portfolio_items && Array.isArray(userData.gdrive_portfolio_items)) {
        // Process Google Drive items and add required fields
        const gdriveItems = userData.gdrive_portfolio_items.map((item, index) => {
          // Generate a unique ID for each Google Drive item
          const uniqueId = `gdrive-${userId}-${index}-${Date.now()}`;

          // Determine media type from URL or default to image
          let mediaType = 'image';
          if (item.media_url) {
            if (item.media_url.includes('video')) {
              mediaType = 'video';
            } else if (item.media_url.includes('audio')) {
              mediaType = 'audio';
            }
          }

          // Return a properly formatted PortfolioItem
          return {
            id: item.id || uniqueId,
            userId: userId,
            title: item.title || 'Untitled',
            description: item.description || '',
            media_url: item.media_url || '',
            media_type: mediaType as 'image' | 'video' | 'audio',
            tools_used: item.tools_used || [],
            categories: item.categories || [],
            likes: item.likes || 0,
            views: item.views || 0,
            is_public: item.is_public !== undefined ? item.is_public : true,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || item.created_at || new Date().toISOString()
          } as PortfolioItem;
        });

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
