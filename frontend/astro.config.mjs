// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Use server output for SSR
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [solidJs()]
});
