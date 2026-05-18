// @ts-check
import { defineConfig } from 'astro/config';

/** Canonical base URL — dùng cho import.meta.env.SITE, sitemap, OG (khớp src/config/site.ts) */
const site = import.meta.env.PUBLIC_SITE_URL || 'https://basel.luxuchi.com';

// https://astro.build/config
export default defineConfig({
  site,
});
