
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, PortfolioItem } from '@/types';

export const fetchUserProfile = async (username: string): Promise<User> => {
  try {
    // Query for user by username
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found');
    }
    
    const userData = querySnapshot.docs[0].data() as User;
    return {
      ...userData,
      id: querySnapshot.docs[0].id,
      uid: querySnapshot.docs[0].id,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const fetchPortfolioItems = async (userId: string): Promise<PortfolioItem[]> => {
  try {
    const portfolioRef = collection(db, 'portfolio');
    const q = query(portfolioRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as PortfolioItem[];
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw error;
  }
};
