
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
  ];

  // Check if we're in a Lovable environment
  const isLovableEnvironment = window.location.hostname.includes('lovableproject.com');

  // Use dummy values for Lovable environment
  if (isLovableEnvironment) {
    console.log('Running in Lovable environment, using default Firebase config');
    return {
      VITE_FIREBASE_API_KEY: "AIzaSyCSSBKFkrnBoK0b1Y3RmA97WdwcY9YLKcA",
      VITE_FIREBASE_AUTH_DOMAIN: "smai-og.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "smai-og",
      VITE_FIREBASE_STORAGE_BUCKET: "smai-og.appspot.com",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "220186510992",
      VITE_FIREBASE_APP_ID: "1:220186510992:web:3d9e07c3df55d1f4ea7a15",
      VITE_FIREBASE_MEASUREMENT_ID: "G-4MR0WK595H",
      VITE_FIREBASE_DATABASE_URL: "https://smai-og-default-rtdb.firebaseio.com"
    } as ImportMetaEnv;
  }

  // Validate environment variables in non-Lovable environments
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
