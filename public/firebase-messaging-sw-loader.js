// This script loads the Firebase configuration into the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Get Firebase config from the environment
      const firebaseConfig = {
        apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env?.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID
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
