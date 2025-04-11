
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  TwitterAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Define provider types
type Provider = 'google' | 'github' | 'twitter';

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
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
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
        username: firebaseUser.displayName,
        avatar_url: firebaseUser.photoURL,
        is_premium: false,
        claude_enabled: false,
        created_at: serverTimestamp(),
        role: 'basic',
        xp: 0,
        level: 1,
        streak_days: 0,
        last_login: new Date().toISOString(),
        badges: []
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
      
      // If user exists, update last login
      const userData = userDoc.data();
      await setDoc(userRef, {
        ...userData,
        last_login: serverTimestamp()
      }, { merge: true });
      
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
        badges: []
      } as AuthUser;
    }
  };

  // Sign in with provider function
  const signInWithProvider = async (providerName: Provider) => {
    setIsLoading(true);
    try {
      // Set up authentication provider
      let provider;
      switch (providerName) {
        case 'google':
          provider = new GoogleAuthProvider();
          break;
        case 'github':
          provider = new GithubAuthProvider();
          break;
        case 'twitter':
          provider = new TwitterAuthProvider();
          break;
        default:
          throw new Error(`Unsupported provider: ${providerName}`);
      }
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      const userData = await getUserData(result.user);
      setUser(userData);
      
      // Show success toast
      toast({ 
        title: 'Signed in successfully',
        variant: 'success'
      });
      
    } catch (error: any) {
      console.error('Auth error:', error);
      
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

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
