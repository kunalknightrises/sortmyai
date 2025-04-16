import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import { fetchPortfolioItems } from './portfolioService';

// Fetch users who have portfolio items
export const fetchCreatorsWithPortfolio = async (limitCount = 20): Promise<User[]> => {
  try {
    // Get all users
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      // Order by username to ensure consistent ordering
      orderBy('username'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    // Map users and filter out those without usernames
    const users = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          uid: doc.id,
          xp: data.xp || 0,
          level: data.level || 1,
          streak_days: data.streak_days || 0,
          last_login: data.last_login || new Date().toISOString(),
          badges: data.badges || [],
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0
        } as User;
      })
      .filter(user => !!user.username); // Filter out users without usernames

    // For each user, check if they have portfolio items
    const usersWithPortfolio = await Promise.all(
      users.map(async (user) => {
        try {
          const portfolioItems = await fetchPortfolioItems(user.id);
          return {
            user,
            portfolioCount: portfolioItems.length,
            hasPortfolio: portfolioItems.length > 0
          };
        } catch (error) {
          console.error(`Error fetching portfolio for user ${user.id}:`, error);
          return {
            user,
            portfolioCount: 0,
            hasPortfolio: false
          };
        }
      })
    );

    // Return only users who have portfolio items
    return usersWithPortfolio
      .filter(item => item.hasPortfolio)
      .map(item => item.user);
  } catch (error) {
    console.error('Error fetching creators with portfolio:', error);
    throw error;
  }
};

// Search creators by username
export const searchCreators = async (searchTerm: string, limitCount = 20): Promise<User[]> => {
  try {
    if (!searchTerm.trim()) {
      return fetchCreatorsWithPortfolio(limitCount);
    }

    // Get users whose username contains the search term
    const usersRef = collection(db, 'users');
    const searchTermLower = searchTerm.toLowerCase();

    // Firebase doesn't support case-insensitive search directly,
    // so we'll fetch all users and filter client-side
    const q = query(
      usersRef,
      orderBy('username'),
      limit(100) // Fetch more to allow for filtering
    );

    const querySnapshot = await getDocs(q);

    // Map users and filter by search term
    const users = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          uid: doc.id,
          xp: data.xp || 0,
          level: data.level || 1,
          streak_days: data.streak_days || 0,
          last_login: data.last_login || new Date().toISOString(),
          badges: data.badges || [],
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0
        } as User;
      })
      .filter(user =>
        !!user.username &&
        user.username.toLowerCase().includes(searchTermLower)
      )
      .slice(0, limitCount);

    // For each user, check if they have portfolio items
    const usersWithPortfolio = await Promise.all(
      users.map(async (user) => {
        try {
          const portfolioItems = await fetchPortfolioItems(user.id);
          return {
            user,
            portfolioCount: portfolioItems.length,
            hasPortfolio: portfolioItems.length > 0
          };
        } catch (error) {
          console.error(`Error fetching portfolio for user ${user.id}:`, error);
          return {
            user,
            portfolioCount: 0,
            hasPortfolio: false
          };
        }
      })
    );

    // Return only users who have portfolio items
    return usersWithPortfolio
      .filter(item => item.hasPortfolio)
      .map(item => item.user);
  } catch (error) {
    console.error('Error searching creators:', error);
    throw error;
  }
};
