import { createContext, useContext, useEffect, useState } from 'react';
import type { UserInfo } from '@firebase/auth-types';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, enableNetwork } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/firebase-errors';
import { useFirebaseConnection } from './FirebaseConnectionContext';

export interface AuthUser extends UserInfo {
  username?: string;
  is_premium?: boolean;
  claude_enabled?: boolean;
  created_at?: string;
  avatar_url?: string;
  role?: 'admin' | 'intern' | 'basic';
}

interface AuthContextProps {
  children: React.ReactNode;
}

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'twitter') => Promise<void>;
  updateUserData: (data: Partial<AuthUser>) => Promise<void>;
  isAdmin: boolean;
  isIntern: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthContextProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isOnline, forceReconnect } = useFirebaseConnection();

  useEffect(() => {
    // Set persistence to LOCAL at startup
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: UserInfo | null) => {
      try {
        if (firebaseUser) {
          // Ensure network is enabled
          await enableNetwork(db);
          
          // Get user profile from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || undefined,
              ...userSnap.data()
            } as AuthUser);
          } else {
            // If no profile exists yet, create one with default values
            const defaultProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
              is_premium: false,
              claude_enabled: false,
              created_at: new Date().toISOString(),
              role: 'basic'
            };
            
            if (isOnline) {
              await setDoc(userRef, defaultProfile);
              setUser(defaultProfile as AuthUser);
            } else {
              // If offline, store minimal user data
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || undefined,
                displayName: firebaseUser.displayName || undefined,
              } as AuthUser);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        
        if (!isOnline) {
          toast({
            title: "Network Error",
            description: "You appear to be offline. Please check your connection and try again.",
            variant: "destructive",
          });
          
          // Attempt to reconnect
          await forceReconnect();
        } else {
          toast({
            title: "Authentication Error",
            description: getErrorMessage(error),
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Authentication error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email,
        username,
        is_premium: false,
        claude_enabled: false,
        created_at: new Date().toISOString(),
        role: 'basic'
      });

      toast({
        title: "Account created!",
        description: "Welcome to SortMyAI.",
      });
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Registration error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: "Signed out",
        description: "You've been successfully logged out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const getProvider = (name: string) => {
    switch (name) {
      case 'google':
        const provider = new GoogleAuthProvider();
        // Add scopes and custom parameters
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
          client_id: '220186510992-5oa2tojm2o51qh4324ao7fe0mmfkh021.apps.googleusercontent.com',
          prompt: 'select_account'
        });
        return provider;
      case 'github':
        return new GithubAuthProvider();
      case 'twitter':
        return new TwitterAuthProvider();
      default:
        throw new Error('Unsupported provider');
    }
  };

  const signInWithProvider = async (providerName: 'google' | 'github' | 'twitter') => {
    if (!isOnline) {
      toast({
        title: "Network Error",
        description: "You must be online to sign in. Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = getProvider(providerName);
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user profile exists, if not create one
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          is_premium: false,
          claude_enabled: false,
          created_at: new Date().toISOString(),
          avatar_url: firebaseUser.photoURL || undefined,
          role: 'basic'
        });
      }

      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      });
    } catch (error) {
      console.error(`Sign in with ${providerName} error:`, error);
      
      if (!isOnline) {
        toast({
          title: "Network Error",
          description: "You appear to be offline. Please check your connection and try again.",
          variant: "destructive",
        });
        await forceReconnect();
      } else {
        toast({
          title: "Authentication error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const updateUserData = async (data: Partial<AuthUser>) => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...user, ...data }, { merge: true });
      setUser((prev: AuthUser | null) => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      toast({
        title: "Update error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin';
  const isIntern = user?.role === 'intern';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithProvider,
        updateUserData,
        isAdmin,
        isIntern,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
