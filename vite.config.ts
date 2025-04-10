
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Force production mode for Firebase
  const forceProduction = true
  
  // Firebase config from firebaseinfo.txt
  const firebaseConfig = {
    apiKey: "AIzaSyCSSBKFkrnBoK0b1Y3RmA97WdwcY9YLKcA",
    authDomain: "smai-og.firebaseapp.com",
    projectId: "smai-og",
    storageBucket: "smai-og.firebasestorage.app",
    messagingSenderId: "220186510992",
    appId: "1:220186510992:web:3d9e07c3df55d1f4ea7a15",
    measurementId: "G-4MR0WK595H",
    databaseURL: "https://smai-og-default-rtdb.firebaseio.com"
  }
  
  return {
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __USE_EMULATOR__: JSON.stringify(forceProduction ? false : env.VITE_USE_EMULATOR === 'true'),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseConfig.apiKey),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseConfig.authDomain),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(firebaseConfig.projectId),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseConfig.storageBucket),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseConfig.messagingSenderId),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(firebaseConfig.appId),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(firebaseConfig.measurementId),
      'import.meta.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(firebaseConfig.databaseURL),
    },
    server: {
      host: "::",
      port: 8080
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
