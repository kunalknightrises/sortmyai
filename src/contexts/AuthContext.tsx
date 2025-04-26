import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { directSignIn, ProviderType, getAuthRedirectResult } from '@/lib/simple-auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Use the ProviderType from simple-auth
type Provider = ProviderType;

// Define auth user type with extra fields
export interface AuthUser extends User {
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  providerId?: string;
}

// Define context value type
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin?: boolean;
  isIntern?: boolean;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to get or create user in Firestore
  const getUserData = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      // Default user data for new users
      const defaultUserData = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        avatar_url: firebaseUser.photoURL,
        is_premium: false,
        claude_enabled: false,
        created_at: serverTimestamp(),
        role: 'basic',
        xp: 0,
        level: 1,
        streak_days: 0,
        last_login: new Date().toISOString(),
        badges: [],
        followers_count: 0,
        following_count: 0,
        following: []
      };

      // If user not found, create new user
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          ...defaultUserData,
          created_at: serverTimestamp()
        });

        return {
          ...defaultUserData,
          created_at: new Date().toISOString()
        } as AuthUser;
      }

      // If user exists, update last login and sync username with displayName if needed
      const userData = userDoc.data();
      const updateData: any = {
        ...userData,
        last_login: serverTimestamp()
      };

      // If displayName exists and is different from username, update username
      if (firebaseUser.displayName &&
          firebaseUser.displayName !== userData.username) {
        updateData.username = firebaseUser.displayName;
        console.log('Syncing username with displayName:', firebaseUser.displayName);
      }

      await setDoc(userRef, updateData, { merge: true });

      // Return user data with AuthUser type
      return {
        ...userData,
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        providerId: firebaseUser.providerId,
        xp: userData.xp || 0,
        level: userData.level || 1,
        streak_days: userData.streak_days || 0,
        last_login: new Date().toISOString(),
        badges: userData.badges || []
      } as unknown as AuthUser;
    } catch (error) {
      console.error('Error getting/creating user:', error);
      // Return basic user data in case of error
      return {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        username: firebaseUser.displayName || undefined,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        providerId: firebaseUser.providerId,
        xp: 0,
        level: 1,
        streak_days: 0,
        last_login: new Date().toISOString(),
        badges: [],
        followers_count: 0,
        following_count: 0,
        following: []
      } as AuthUser;
    }
  };

  // Sign in with provider function - uses our simplified auth approach
  const signInWithProvider = async (providerName: Provider) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting sign in with provider:', providerName);

      // Use our direct sign-in method that handles both popup and redirect
      const user = await directSignIn(providerName);

      if (user) {
        console.log('AuthContext: User signed in successfully:', user.uid);
        const userData = await getUserData(user);
        setUser(userData);

        toast({
          title: 'Signed in successfully',
          variant: 'success'
        });

        // Force navigation to dashboard for consistency
        window.location.href = '/dashboard';
      }
      // If no user is returned, it means a redirect was initiated
      // The result will be handled in the useEffect below

    } catch (error: any) {
      console.error('AuthContext: Auth error:', error);

      // Show error toast
      toast({
        title: 'Sign-in failed',
        description: error.message || 'An error occurred during sign-in',
        variant: 'destructive'
      });

    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({
        title: 'Signed out successfully',
        variant: 'success'
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign-out failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      const userData = await getUserData(auth.currentUser);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine user roles
  const isAdmin = user?.role === 'admin';
  const isIntern = user?.role === 'intern';

  // Listen for auth state changes and handle redirect result
  useEffect(() => {
    console.log('AuthContext: Setting up auth listeners');
    let unsubscribe: () => void;
    let isHandlingRedirect = false;

    const handleRedirectResult = async () => {
      try {
        isHandlingRedirect = true;
        console.log('AuthContext: Checking for redirect result');
        // Check if there's a redirect result using our simplified auth
        const result = await getAuthRedirectResult();
        console.log('AuthContext: Redirect result:', result ? 'Success' : 'No result');

        if (result && result.user) {
          console.log('AuthContext: User authenticated via redirect:', result.user.uid);
          // User just signed in with redirect
          const userData = await getUserData(result.user);
          setUser(userData);

          // Show success toast
          toast({
            title: 'Signed in successfully',
            variant: 'success'
          });

          // Force navigation to dashboard
          window.location.href = '/dashboard';
          return true;
        }
        return false;
      } catch (error: any) {
        console.error('AuthContext: Redirect sign-in error:', error);
        toast({
          title: 'Sign-in failed',
          description: error.message || 'An error occurred during sign-in',
          variant: 'destructive'
        });
        return false;
      } finally {
        isHandlingRedirect = false;
      }
    };

    // Handle redirect result first
    handleRedirectResult().then((redirectHandled) => {
      if (!redirectHandled) {
        console.log('AuthContext: Setting up auth state listener');
        // Then set up the auth state listener
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (isHandlingRedirect) {
            console.log('AuthContext: Skipping auth state change during redirect handling');
            return;
          }

          setIsLoading(true);
          console.log('AuthContext: Auth state changed:', firebaseUser ? 'User logged in' : 'No user');

          if (firebaseUser) {
            const userData = await getUserData(firebaseUser);
            console.log('AuthContext: User data retrieved from Firestore');
            setUser(userData);
          } else {
            setUser(null);
          }

          setIsLoading(false);
        });
      }
    });

    // Clean up subscription
    return () => {
      if (unsubscribe) {
        console.log('AuthContext: Cleaning up auth listener');
        unsubscribe();
      }
    };
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, isIntern, signInWithProvider, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
