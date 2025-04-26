import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { PortfolioItem } from '@/types';

interface PortfolioContextType {
  portfolioItems: PortfolioItem[];
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType>({
  portfolioItems: [],
  loading: false,
  error: null,
  refreshPortfolio: async () => {}
});

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPortfolioItems = async () => {
    if (!user) {
      setPortfolioItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const portfolioRef = collection(db, 'portfolio');
      const q = query(
        portfolioRef,
        where('user_id', '==', user.uid),
        where('status', 'in', ['active', 'draft']), // Exclude deleted and archived items
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const items: PortfolioItem[] = [];

      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        } as PortfolioItem);
      });

      setPortfolioItems(items);
    } catch (err) {
      console.error('Error fetching portfolio items:', err);
      setError('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioItems();
  }, [user]);

  const refreshPortfolio = async () => {
    await fetchPortfolioItems();
  };

  return (
    <PortfolioContext.Provider value={{ portfolioItems, loading, error, refreshPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioProvider;
