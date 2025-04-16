import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
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
          badges: data.badges || [],
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0
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
      badges: userData.badges || [],
      followers_count: userData.followers_count || 0,
      following_count: userData.following_count || 0
    } as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Function to migrate existing portfolio items to include content_type
export const migratePortfolioItems = async (userId: string): Promise<void> => {
  try {
    // Get the user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData?.gdrive_portfolio_items && Array.isArray(userData.gdrive_portfolio_items)) {
      // Check if any items are missing content_type
      const needsMigration = userData.gdrive_portfolio_items.some(item => !item.content_type);

      if (needsMigration) {
        console.log('Migrating portfolio items to add content_type field...');

        // Update each item to include content_type if missing
        const updatedItems = userData.gdrive_portfolio_items.map(item => {
          if (!item.content_type) {
            return {
              ...item,
              content_type: 'post' // Default to 'post' for backward compatibility
            };
          }
          return item;
        });

        // Update the user document with the migrated items
        await updateDoc(userRef, {
          gdrive_portfolio_items: updatedItems
        });

        console.log('Migration completed successfully');
      } else {
        console.log('No migration needed, all items have content_type field');
      }
    }
  } catch (error) {
    console.error('Error migrating portfolio items:', error);
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

          // Debug content_type
          console.log('Item content_type:', item.content_type);

          // Return a properly formatted PortfolioItem
          return {
            id: item.id || uniqueId,
            userId: userId,
            title: item.title || 'Untitled',
            description: item.description || '',
            media_url: item.media_url || '',
            media_urls: item.media_urls || (item.media_url ? [item.media_url] : []),
            media_type: mediaType as 'image' | 'video' | 'audio',
            content_type: item.content_type || 'post',
            tools_used: item.tools_used || [],
            categories: item.categories || [],
            likes: item.likes || 0,
            views: item.views || 0,
            project_url: item.project_url || '',
            is_public: item.is_public !== undefined ? item.is_public : true,
            status: item.status || 'published',
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || item.created_at || new Date().toISOString(),
            deleted_at: item.deleted_at || undefined,
            archived_at: item.archived_at || undefined
          } as PortfolioItem;
        });

        items.push(...gdriveItems);
      }
    } catch (error) {
      console.warn('Could not fetch Google Drive items:', error);
    }

    // Debug final items
    console.log('All portfolio items:', items);
    console.log('Items with content_type=reel:', items.filter(item => item.content_type === 'reel'));
    console.log('Items with content_type=both:', items.filter(item => item.content_type === 'both'));

    return items.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw error;
  }
};
