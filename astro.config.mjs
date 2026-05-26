// @ts-check
import { defineConfig } from 'astro/config';

/** Canonical base URL — dùng cho import.meta.env.SITE, sitemap, OG (khớp src/config/site.ts) */
const site = import.meta.env.PUBLIC_SITE_URL || 'https://themes.the4.co/basel-1';

// https://astro.build/config
export default defineConfig({
  site,
  base: '/basel-1/',
});
