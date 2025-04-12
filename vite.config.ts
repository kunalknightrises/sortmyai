import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from 'lovable-tagger'

const config: UserConfig = {
  plugins: [
    react(),
    componentTagger()
  ],
  publicDir: 'public',
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 8080,
    host: '::',
    allowedHosts: ['.lovableproject.com']
  }
}

export default defineConfig(({ mode }) => {
  if (mode !== 'development') {
    // Remove the componentTagger plugin in non-development modes
    config.plugins = config.plugins?.filter(p => p !== componentTagger())
  }
  return config
})
