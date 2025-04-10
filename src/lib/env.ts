
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

  // For Lovable preview environments
  if (import.meta.env.VITE_IS_PREVIEW) {
    import.meta.env.IS_PREVIEW = true;
  }

  // Check if we're in a Lovable preview environment
  const isLovableEnvironment = window.location.hostname.includes('lovableproject.com');

  // Skip validation in Lovable environment since we're injecting values in vite.config.ts
  if (isLovableEnvironment) {
    console.log('Running in Lovable environment, using injected Firebase config');
    return import.meta.env as ImportMetaEnv;
  }

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
