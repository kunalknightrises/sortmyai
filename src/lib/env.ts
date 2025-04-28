
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
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID',
  ];  // First check if environment variables are available directly
  const hasEnvVars = requiredEnvVars.every(
    (envVar) => import.meta.env[envVar as keyof ImportMetaEnv]
  );

  // If we have all env vars, use them
  if (hasEnvVars) {
    return import.meta.env as ImportMetaEnv;
  }

  // Otherwise, check if we're in a development or known environment
  const isKnownEnvironment = typeof window !== 'undefined' && (
    window.location.hostname.includes('lovableproject.com') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('sortmyai.com') ||
    window.location.hostname.includes('sortmind.com') ||
    window.location.hostname.includes('vercel.app')
  );
  // Use default values for known environments when env vars aren't available
  if (isKnownEnvironment && !hasEnvVars) {
    console.log('Running in known environment, using default Firebase config');
    return {
      VITE_FIREBASE_API_KEY: "AIzaSyCSSBKFkrnBoK0b1Y3RmA97WdwcY9YLKcA",
      VITE_FIREBASE_AUTH_DOMAIN: "smai-og.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "smai-og",
      VITE_FIREBASE_STORAGE_BUCKET: "smai-og.firebasestorage.app",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "220186510992",
      VITE_FIREBASE_APP_ID: "1:220186510992:web:3d9e07c3df55d1f4ea7a15",
      VITE_FIREBASE_MEASUREMENT_ID: "G-4MR0WK595H",
      VITE_FIREBASE_DATABASE_URL: "https://smai-og-default-rtdb.firebaseio.com"
    } as ImportMetaEnv;
  }

  // Check for missing environment variables in non-Lovable environments
  const missingVars = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar as keyof ImportMetaEnv]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(
        ', '
      )}. Please check your .env file and make sure all required variables are set.`
    );
  }

  return import.meta.env as ImportMetaEnv;
};
