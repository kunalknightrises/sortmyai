
interface ImportMetaEnv {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
  VITE_FIREBASE_DATABASE_URL?: string;
  VITE_USE_EMULATOR?: string;
  VITE_IS_PREVIEW?: string;
}

export const validateEnv = () => {
  // Default Firebase configuration that will be used if environment variables are not available
  const defaultConfig = {
    VITE_FIREBASE_API_KEY: "AIzaSyCSSBKFkrnBoK0b1Y3RmA97WdwcY9YLKcA",
    VITE_FIREBASE_AUTH_DOMAIN: "smai-og.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "smai-og",
    VITE_FIREBASE_STORAGE_BUCKET: "smai-og.firebasestorage.app",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "220186510992",
    VITE_FIREBASE_APP_ID: "1:220186510992:web:3d9e07c3df55d1f4ea7a15",
    VITE_FIREBASE_MEASUREMENT_ID: "G-4MR0WK595H",
    VITE_FIREBASE_DATABASE_URL: "https://smai-og-default-rtdb.firebaseio.com"
  };

  // IMPORTANT: Always return the default config for Lovable preview environments
  // This is a direct fix for the Lovable preview environment issue
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLovablePreview =
      hostname.includes('lovableproject.com') ||
      hostname.includes('cluster-') ||
      hostname.includes('preview.lovable.dev');

    if (isLovablePreview) {
      console.log('Running in Lovable preview environment, using default Firebase config');
      return defaultConfig as ImportMetaEnv;
    }
  }

  // For non-Lovable environments, try to use environment variables first
  try {
    // List of required environment variables
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_FIREBASE_MEASUREMENT_ID',
    ];

    // Check if we have access to import.meta.env
    if (typeof import.meta.env !== 'undefined') {
      // Check if all required environment variables are available
      const hasAllEnvVars = requiredEnvVars.every(
        (envVar) => import.meta.env[envVar as keyof ImportMetaEnv]
      );

      // If all environment variables are available, use them
      if (hasAllEnvVars) {
        console.log('Using environment variables for Firebase config');
        return import.meta.env as ImportMetaEnv;
      }
    }

    // If we reach here, some environment variables are missing or import.meta.env is not available
    console.log('Some environment variables are missing, using default Firebase config');
    return defaultConfig as ImportMetaEnv;
  } catch (error) {
    // If there's any error, fall back to the default configuration
    console.error('Error accessing environment variables:', error);
    console.log('Falling back to default Firebase config');
    return defaultConfig as ImportMetaEnv;
  }
};
