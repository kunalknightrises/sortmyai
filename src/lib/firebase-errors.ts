import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/email-already-in-use': 'An account already exists with this email.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/requires-recent-login': 'Please log in again to complete this action.',
  'auth/popup-closed-by-user': 'Sign in was cancelled.',
  'auth/unauthorized-domain': 'This domain is not authorized for OAuth operations.',
};

const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  'storage/unauthorized': 'You do not have permission to access this file.',
  'storage/canceled': 'Upload was cancelled.',
  'storage/unknown': 'An unknown error occurred during upload.',
};

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested document was not found.',
  'already-exists': 'A document with this ID already exists.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const code = error.code;
    
    // Check auth errors
    if (code.startsWith('auth/')) {
      return AUTH_ERROR_MESSAGES[code] || 'Authentication error occurred.';
    }
    
    // Check storage errors
    if (code.startsWith('storage/')) {
      return STORAGE_ERROR_MESSAGES[code] || 'Storage error occurred.';
    }
    
    // Check Firestore errors
    if (FIRESTORE_ERROR_MESSAGES[code]) {
      return FIRESTORE_ERROR_MESSAGES[code];
    }
    
    // Default Firebase error
    return error.message || 'An error occurred with Firebase.';
  }
  
  // For non-Firebase errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}

export function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}