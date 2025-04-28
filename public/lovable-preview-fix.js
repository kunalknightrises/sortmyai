// This script is specifically for fixing Firebase configuration in Lovable preview environments
(function() {
  // Check if we're in a Lovable preview environment
  const hostname = window.location.hostname;
  const isLovablePreview = 
    hostname.includes('lovableproject.com') || 
    hostname.includes('cluster-') || 
    hostname.includes('preview.lovable.dev');
  
  if (isLovablePreview) {
    console.log('Lovable preview environment detected, applying Firebase configuration fix');
    
    // Default Firebase configuration
    window.firebaseDefaultConfig = {
      apiKey: "AIzaSyCSSBKFkrnBoK0b1Y3RmA97WdwcY9YLKcA",
      authDomain: "smai-og.firebaseapp.com",
      projectId: "smai-og",
      storageBucket: "smai-og.firebasestorage.app",
      messagingSenderId: "220186510992",
      appId: "1:220186510992:web:3d9e07c3df55d1f4ea7a15",
      measurementId: "G-4MR0WK595H",
      databaseURL: "https://smai-og-default-rtdb.firebaseio.com"
    };
    
    // Create a mock import.meta.env object if it doesn't exist
    if (typeof window.import === 'undefined') {
      window.import = {};
    }
    
    if (typeof window.import.meta === 'undefined') {
      window.import.meta = {};
    }
    
    if (typeof window.import.meta.env === 'undefined') {
      window.import.meta.env = {};
    }
    
    // Add Firebase configuration to import.meta.env
    window.import.meta.env.VITE_FIREBASE_API_KEY = window.firebaseDefaultConfig.apiKey;
    window.import.meta.env.VITE_FIREBASE_AUTH_DOMAIN = window.firebaseDefaultConfig.authDomain;
    window.import.meta.env.VITE_FIREBASE_PROJECT_ID = window.firebaseDefaultConfig.projectId;
    window.import.meta.env.VITE_FIREBASE_STORAGE_BUCKET = window.firebaseDefaultConfig.storageBucket;
    window.import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID = window.firebaseDefaultConfig.messagingSenderId;
    window.import.meta.env.VITE_FIREBASE_APP_ID = window.firebaseDefaultConfig.appId;
    window.import.meta.env.VITE_FIREBASE_MEASUREMENT_ID = window.firebaseDefaultConfig.measurementId;
    window.import.meta.env.VITE_FIREBASE_DATABASE_URL = window.firebaseDefaultConfig.databaseURL;
    
    console.log('Firebase configuration fix applied for Lovable preview environment');
  }
})();
