import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Stessi URL del sito WordPress originale (es. /cardiologia/), quindi SEO e link esterni invariati.
// Per l'anteprima su GitHub Pages il sito vive in una sottocartella: SITE_URL e BASE_PATH arrivano dal workflow.
export default defineConfig({
  site: process.env.SITE_URL || 'https://praemedica.it',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { format: 'directory', inlineStylesheets: 'auto' },
  vite: {
    build: { assetsInlineLimit: 2048 },
  },
});
