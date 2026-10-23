import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://waynesimmonsjr.com',
  integrations: [sitemap()],
  // Old Jekyll URLs keep working. Never add a /cleantube route here:
  // that path is served by the separate WayneS0628/cleantube repo.
  redirects: {
    '/projects': '/work/',
    '/project/titanic-dtvsnn': '/work/titanic-dtvsnn/',
    '/project/titanic-eda': '/work/titanic-dtvsnn/',
    '/project/survive-the-titanic': '/work/titanic-dtvsnn/',
    '/project/spotify-tracks-explorer': '/work/spotify-tracks-explorer/',
    '/posts': '/writing/',
    '/tags': '/writing/',
    '/elements': '/',
  },
});
