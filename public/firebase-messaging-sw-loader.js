// This script loads the Firebase configuration into the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Default Firebase configuration
      const defaultConfig = {
        apiKey: "AIzaSyCSSBKFkrnBoK0b1Y3RmA97WdwcY9YLKcA",
        authDomain: "smai-og.firebaseapp.com",
        projectId: "smai-og",
        storageBucket: "smai-og.firebasestorage.app",
        messagingSenderId: "220186510992",
        appId: "1:220186510992:web:3d9e07c3df55d1f4ea7a15",
        measurementId: "G-4MR0WK595H"
      };

      // Try to get Firebase config from the environment, fall back to default if not available
      const firebaseConfig = {
        apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
        authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
        projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
        storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
        messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
        appId: import.meta.env?.VITE_FIREBASE_APP_ID || defaultConfig.appId,
        measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || defaultConfig.measurementId
      };

      // Register the service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Pass Firebase config to the service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig
        });
      }

      console.log('Service worker registered successfully');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}
