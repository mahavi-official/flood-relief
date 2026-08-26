import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the bundle small — most users will be on slow 2G/3G connections.
    target: 'es2018',
    cssCodeSplit: true
  }
})
