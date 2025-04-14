import {
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  UserCredential
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Provider types
export type ProviderType = 'google' | 'github' | 'twitter';

// Get the appropriate auth provider
export const getProvider = (providerName: ProviderType) => {
  switch (providerName) {
    case 'google':
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      return googleProvider;
    case 'github':
      return new GithubAuthProvider();
    case 'twitter':
      return new TwitterAuthProvider();
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
};

// We're completely removing popup-based authentication as it's causing issues

// Sign in with redirect - the only method we'll use
export const signInWithProviderRedirect = async (providerName: ProviderType): Promise<void> => {
  try {
    console.log('Setting up provider for redirect:', providerName);
    const provider = getProvider(providerName);

    // Add custom parameters for better compatibility
    if (providerName === 'google') {
      provider.setCustomParameters({
        prompt: 'select_account'
      });
    }

    // Use the browserPopupRedirectResolver to ensure better compatibility
    console.log('Initiating redirect with provider');
    await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
    console.log('Redirect function called successfully');
    return;
  } catch (error) {
    console.error('Error in signInWithProviderRedirect:', error);
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
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user profile
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email?.split('@')[0],
      is_premium: false,
      claude_enabled: false,
      created_at: new Date().toISOString(),
      avatar_url: user.photoURL || undefined,
      role: 'basic'
    });
  }

  return userRef;
};
