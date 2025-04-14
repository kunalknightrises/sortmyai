import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
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

// Sign in with email and password
export const emailSignIn = async (email: string, password: string) => {
  try {
    console.log('Starting email sign-in for:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email sign-in successful');
    
    // Create/update user profile
    await createOrUpdateUserProfile(result.user);
    
    return result.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

// Register with email and password
export const emailRegister = async (email: string, password: string, displayName: string) => {
  try {
    console.log('Starting email registration for:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(result.user, { displayName });
    
    // Create user profile in Firestore
    await createOrUpdateUserProfile(result.user);
    
    console.log('Email registration successful');
    return result.user;
  } catch (error) {
    console.error('Email registration error:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
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
