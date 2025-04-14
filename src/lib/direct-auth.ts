import { 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  TwitterAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut
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

// Simple popup authentication - no redirects
export const popupSignIn = async (providerName: ProviderType) => {
  try {
    console.log('Starting popup sign-in with provider:', providerName);
    const provider = getProvider(providerName);
    
    // Use popup authentication
    const result = await signInWithPopup(auth, provider);
    console.log('Popup sign-in successful');
    
    // Create/update user profile
    await createOrUpdateUserProfile(result.user);
    
    return result.user;
  } catch (error) {
    console.error('Popup sign-in error:', error);
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

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
