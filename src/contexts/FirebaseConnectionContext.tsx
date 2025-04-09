import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

interface FirebaseConnectionState {
  isOnline: boolean;
  isInitializing: boolean;
  forceReconnect: () => Promise<void>;
}

const FirebaseConnectionContext = createContext<FirebaseConnectionState | undefined>(undefined);

export function FirebaseConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const prevOnlineState = useRef(true);

  useEffect(() => {
    // Check online status using browser's navigator
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);
    setIsInitializing(false);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Use a separate effect for toast notifications
  useEffect(() => {
    if (prevOnlineState.current !== isOnline) {
      if (isOnline) {
        toast({
          title: 'Connected',
          description: 'You are now connected to the server.',
        });
        // Enable Firestore network when coming back online
        enableNetwork(db).catch(console.error);
      } else {
        toast({
          title: 'Disconnected',
          description: 'You are currently offline. Some features may be limited.',
          variant: 'destructive',
        });
        // Disable Firestore network when going offline
        disableNetwork(db).catch(console.error);
      }
      prevOnlineState.current = isOnline;
    }
  }, [isOnline, toast]);

  const forceReconnect = async () => {
    try {
      setIsInitializing(true);
      
      // Disable network
      await disableNetwork(db);
      
      // Small delay to ensure disconnection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-enable network
      await enableNetwork(db);
      
      toast({
        title: 'Reconnecting',
        description: 'Attempting to reconnect to the server...',
      });
    } catch (error) {
      console.error('Error during reconnection:', error);
      toast({
        title: 'Reconnection Failed',
        description: 'Unable to reconnect. Please check your internet connection.',
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <FirebaseConnectionContext.Provider
      value={{
        isOnline,
        isInitializing,
        forceReconnect,
      }}
    >
      {children}
    </FirebaseConnectionContext.Provider>
  );
}

export const useFirebaseConnection = () => {
  const context = useContext(FirebaseConnectionContext);
  if (context === undefined) {
    throw new Error('useFirebaseConnection must be used within a FirebaseConnectionProvider');
  }
  return context;
};