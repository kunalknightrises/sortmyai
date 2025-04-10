
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Force production mode for Firebase
  const forceProduction = true
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __USE_EMULATOR__: JSON.stringify(forceProduction ? false : env.VITE_USE_EMULATOR === 'true'),
    },
    server: {
      port: 8080
    }
  }
})
