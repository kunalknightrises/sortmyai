import { 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  TwitterAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  UserCredential,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Set persistence to local for better reliability
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('Auth persistence set to local'))
  .catch(err => console.error('Error setting persistence:', err));

// Provider types
export type ProviderType = 'google' | 'github' | 'twitter';

// Get the appropriate auth provider
export const getProvider = (providerName: ProviderType) => {
  switch (providerName) {
    case 'google':
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      // Add custom parameters for better compatibility
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      return googleProvider;
    case 'github':
      return new GithubAuthProvider();
    case 'twitter':
      return new TwitterAuthProvider();
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
};

// Try popup first, then fall back to redirect if needed
export const signInWithProvider = async (providerName: ProviderType): Promise<UserCredential | null> => {
  try {
    console.log('Starting sign in with provider:', providerName);
    const provider = getProvider(providerName);
    
    // Try popup first (works in most cases)
    try {
      console.log('Attempting popup sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Popup sign-in successful');
      return result;
    } catch (popupError: any) {
      // If popup fails with specific errors, try redirect
      console.warn('Popup sign-in failed, error:', popupError.code);
      
      if (
        popupError.code === 'auth/popup-blocked' || 
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        console.log('Falling back to redirect sign-in...');
        await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
        return null; // Redirect will navigate away
      }
      
      // For other errors, propagate them
      throw popupError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Get redirect result
export const getAuthRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    console.log('Getting redirect result');
    const result = await getRedirectResult(auth, browserPopupRedirectResolver);
    console.log('Redirect result received:', result ? 'Success' : 'No result');
    return result;
  } catch (error) {
    console.error('Error getting redirect result:', error);
    throw error;
  }
};

// Create or update user profile in Firestore
export const createOrUpdateUserProfile = async (user: any) => {
  if (!user) return null;

  try {
    console.log('Creating/updating user profile for:', user.uid);
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email?.split('@')[0],
      is_premium: false,
      claude_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar_url: user.photoURL || undefined,
      role: userSnap.exists() ? userSnap.data().role || 'basic' : 'basic',
      last_login: new Date().toISOString()
    };

    if (!userSnap.exists()) {
      // Create new user
      console.log('Creating new user profile');
      await setDoc(userRef, userData);
    } else {
      // Update existing user
      console.log('Updating existing user profile');
      await setDoc(userRef, {
        ...userData,
        ...userSnap.data(),
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true });
    }

    return userRef;
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

// Direct sign-in function that handles everything
export const directSignIn = async (providerName: ProviderType): Promise<any> => {
  try {
    const result = await signInWithProvider(providerName);
    
    if (result && result.user) {
      // Create/update user profile
      await createOrUpdateUserProfile(result.user);
      return result.user;
    }
    
    return null;
  } catch (error) {
    console.error('Direct sign-in error:', error);
    throw error;
  }
};
