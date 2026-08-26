import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project sites on GitHub Pages live under /<repo>/. Override with
// VITE_BASE_PATH=/ when deploying to a custom domain or Netlify.
const base = process.env.VITE_BASE_PATH ?? '/flood-relief/';

export default defineConfig({
  base,
  // REACT_DEV=1 builds against React's development bundle so hydration mismatches
  // report the offending text instead of a minified error code.
  define: process.env.REACT_DEV ? { 'process.env.NODE_ENV': '"development"' } : {},
  plugins: [react()],
  build: {
    target: 'es2020',
    // Let the lazily-loaded map ship its own stylesheet instead of taxing every page.
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
  },
});
