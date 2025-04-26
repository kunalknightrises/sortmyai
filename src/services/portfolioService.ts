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
// Function to completely reset the gdrive_portfolio_items array (emergency use only)
export const resetGDriveItems = async (userId: string): Promise<void> => {
  try {
    // Get the user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) {
      console.error('User data not found');
      return;
    }

    if (userData?.gdrive_portfolio_items && Array.isArray(userData.gdrive_portfolio_items)) {
      // Get only published items
      const publishedItems = userData.gdrive_portfolio_items.filter(
        (item: any) => item.status === 'published' || !item.status
      );

      console.log(`Found ${publishedItems.length} published items to keep`);

      // Replace the entire array with only published items
      await updateDoc(userRef, {
        gdrive_portfolio_items: publishedItems
      });

      console.log('Successfully reset gdrive_portfolio_items to only published items');
    }
  } catch (error) {
    console.error('Error resetting Google Drive items:', error);
    throw error;
  }
};

// Function to permanently remove deleted items from Google Drive portfolio
export const removeDeletedGDriveItems = async (userId: string): Promise<void> => {
  try {
    // Get the user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) {
      console.error('User data not found');
      return;
    }

    console.log('Current user data:', userData);

    if (userData?.gdrive_portfolio_items && Array.isArray(userData.gdrive_portfolio_items)) {
      // Log all items before filtering
      console.log('All portfolio items before filtering:', userData.gdrive_portfolio_items);

      // Filter out items with status 'deleted'
      const deletedItems = userData.gdrive_portfolio_items.filter(
        (item: any) => item.status === 'deleted'
      );

      console.log(`Found ${deletedItems.length} deleted Google Drive items to remove:`, deletedItems);

      // Instead of removing items one by one, create a new array without deleted items
      const cleanedItems = userData.gdrive_portfolio_items.filter(
        (item: any) => item.status !== 'deleted'
      );

      console.log(`New array will have ${cleanedItems.length} items:`, cleanedItems);

      // Update the entire array at once with a completely new array
      await updateDoc(userRef, {
        gdrive_portfolio_items: cleanedItems
      });

      // Verify the update by fetching the document again
      const updatedDoc = await getDoc(userRef);
      const updatedData = updatedDoc.data();

      if (updatedData?.gdrive_portfolio_items) {
        console.log('Updated portfolio items:', updatedData.gdrive_portfolio_items);
        console.log(`Verification: Now has ${updatedData.gdrive_portfolio_items.length} items`);

        // Check if any deleted items still exist
        const remainingDeletedItems = updatedData.gdrive_portfolio_items.filter(
          (item: any) => item.status === 'deleted'
        );

        if (remainingDeletedItems.length > 0) {
          console.error(`ERROR: ${remainingDeletedItems.length} deleted items still remain after update!`);
          console.error('Remaining deleted items:', remainingDeletedItems);
        } else {
          console.log('SUCCESS: All deleted items have been removed');
        }
      }
    } else {
      console.log('No gdrive_portfolio_items found or it is not an array');
    }
  } catch (error) {
    console.error('Error removing deleted Google Drive items:', error);
    throw error;
  }
};

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

// Get a single portfolio item by ID
export const getPortfolioItemById = async (itemId: string): Promise<PortfolioItem | null> => {
  try {
    // First try to get from the portfolio collection
    const portfolioDoc = await getDoc(doc(db, 'portfolio', itemId));

    if (portfolioDoc.exists()) {
      return {
        id: portfolioDoc.id,
        ...portfolioDoc.data()
      } as PortfolioItem;
    }

    // If not found in the collection, search in all users' portfolio items
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      // Check if user has gdrive_portfolio_items
      if (userData.gdrive_portfolio_items && Array.isArray(userData.gdrive_portfolio_items)) {
        const item = userData.gdrive_portfolio_items.find((item: any) => item.id === itemId);

        if (item) {
          return {
            ...item,
            userId: userDoc.id,
            authorId: userDoc.id,
            authorName: userData.username || 'Unknown User',
            authorAvatar: userData.avatar_url || ''
          } as PortfolioItem;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting portfolio item by ID:', error);
    throw error;
  }
};

export const fetchPortfolioItems = async (userId: string, includeDeleted: boolean = true): Promise<PortfolioItem[]> => {
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
        // Log all items before filtering
        console.log('All gdrive_portfolio_items before filtering:', userData.gdrive_portfolio_items);

        // Filter items based on includeDeleted parameter
        const filteredItems = includeDeleted
          ? userData.gdrive_portfolio_items // Include all items
          : userData.gdrive_portfolio_items.filter(
              (item: any) => {
                // Only keep items that are explicitly published or have no status (for backward compatibility)
                const isPublished = item.status === 'published' || !item.status;

                // Log each item's status for debugging
                console.log(`Item ${item.id || 'unknown'}: status=${item.status || 'undefined'}, keeping=${isPublished}`);

                return isPublished;
              }
            );

        console.log(`${includeDeleted ? 'Including' : 'Filtered out'} ${userData.gdrive_portfolio_items.length - filteredItems.length} non-published items`);
        console.log('Items to process:', filteredItems);

        // Process Google Drive items and add required fields
        const gdriveItems = filteredItems.map((item, index) => {
          // Use existing ID if available, otherwise generate a stable unique ID
          // We use a stable ID format that doesn't change on refresh
          // If the item has a media_url, use that as part of the ID to ensure stability
          const mediaUrlHash = item.media_url ?
            `-${item.media_url.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '')}` :
            '';
          const uniqueId = item.id || `gdrive-${userId}-${index}${mediaUrlHash}`;

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
            id: uniqueId,
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
            comments: item.comments || 0,
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
    console.log('All portfolio items before filtering:', items);
    console.log('Items with content_type=reel:', items.filter(item => item.content_type === 'reel'));
    console.log('Items with content_type=both:', items.filter(item => item.content_type === 'both'));

    // Final filtering based on includeDeleted parameter
    const finalItems = includeDeleted
      ? items // Include all items
      : items.filter(item => {
          // Only keep items that are explicitly published or have no status (for backward compatibility)
          const isPublished = item.status === 'published' || !item.status;

          // Log each item's status for debugging
          console.log(`Final filter - Item ${item.id}: status=${item.status || 'undefined'}, keeping=${isPublished}`);

          return isPublished;
        });

    console.log(`Final items (${includeDeleted ? 'all' : 'only published'})`, finalItems);
    if (!includeDeleted) {
      console.log('Excluded items:', items.filter(item =>
        item.status !== 'published' && item.status !== undefined
      ));
    }

    return finalItems.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw error;
  }
};
