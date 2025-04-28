
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

  try {
    // Check if all required environment variables are available
    const hasAllEnvVars = requiredEnvVars.every(
      (envVar) => import.meta.env[envVar as keyof ImportMetaEnv]
    );

    // If all environment variables are available, use them
    if (hasAllEnvVars) {
      console.log('Using environment variables for Firebase config');
      return import.meta.env as ImportMetaEnv;
    }

    // If any environment variables are missing, use the default configuration
    console.log('Some environment variables are missing, using default Firebase config');

    // Create a merged configuration that uses environment variables when available
    // and falls back to default values when they're not
    const mergedConfig = { ...defaultConfig } as ImportMetaEnv;

    // Copy any available environment variables
    for (const key of Object.keys(defaultConfig)) {
      if (import.meta.env[key as keyof ImportMetaEnv]) {
        mergedConfig[key as keyof ImportMetaEnv] = import.meta.env[key as keyof ImportMetaEnv];
      }
    }

    // Copy any additional environment variables not in the default config
    for (const key in import.meta.env) {
      if (!(key in defaultConfig) && key.startsWith('VITE_')) {
        mergedConfig[key as keyof ImportMetaEnv] = import.meta.env[key as keyof ImportMetaEnv];
      }
    }

    return mergedConfig;
  } catch (error) {
    // If there's any error, fall back to the default configuration
    console.error('Error accessing environment variables:', error);
    console.log('Falling back to default Firebase config');
    return defaultConfig as ImportMetaEnv;
  }
};
