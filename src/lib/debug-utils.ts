// Debug utility functions

import { auth } from './firebase';

// Check if the user is authenticated in Firebase
export const checkAuthState = () => {
  if (auth) {
    const user = auth.currentUser;
    console.log('Current auth state:', user ? 'Authenticated' : 'Not authenticated');
    if (user) {
      console.log('User ID:', user.uid);
      console.log('Email:', user.email);
      console.log('Display name:', user.displayName);
    }
    return user;
  } else {
    console.log('Firebase auth not available');
    return null;
  }
};

// Check local storage for auth data
export const checkLocalStorage = () => {
  try {
    // Check for Firebase auth data in localStorage
    const keys = Object.keys(localStorage);
    const firebaseKeys = keys.filter(key => key.includes('firebase'));
    console.log('Firebase-related localStorage keys:', firebaseKeys);

    // Check for session storage
    const sessionKeys = Object.keys(sessionStorage);
    const firebaseSessionKeys = sessionKeys.filter(key => key.includes('firebase'));
    console.log('Firebase-related sessionStorage keys:', firebaseSessionKeys);

    return { firebaseKeys, firebaseSessionKeys };
  } catch (error) {
    console.error('Error checking storage:', error);
    return { firebaseKeys: [], firebaseSessionKeys: [] };
  }
};

// Debug helper to be called from console
export const debugAuth = () => {
  console.log('=== Auth Debugging ===');
  checkAuthState();
  checkLocalStorage();
  console.log('=====================');
};

// Make debug functions available globally
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).checkAuthState = checkAuthState;
  (window as any).checkLocalStorage = checkLocalStorage;
}
