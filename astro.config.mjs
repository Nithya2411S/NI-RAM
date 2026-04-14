// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// output: 'server' enables SSR — required for API routes that use
// Node.js modules (ephemeris, node-geocoder).
// Add @astrojs/vercel adapter in Phase 6 (deployment).
export default defineConfig({
  output: 'server',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: 'standalone',
  }),
});