import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, PortfolioItem } from '@/types';

export async function fetchUserProfile(username: string): Promise<User> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('User not found');
  }
  
  const userData = querySnapshot.docs[0].data() as User;
  return { ...userData, id: querySnapshot.docs[0].id };
}

export async function fetchPortfolioItems(userId: string): Promise<PortfolioItem[]> {
  const portfolioRef = collection(db, 'portfolios');
  const q = query(portfolioRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...(doc.data() as PortfolioItem),
    id: doc.id
  }));
}