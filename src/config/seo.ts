import { assetUrl, buildPageUrl } from "./assets";
import { demoItems } from "./data";

export { buildPageUrl };

const demo_count = demoItems.length || 15;

export const defaultSeo = {
  title: "Basel | Shopify Themes Premium",
  description:
    `Launch your Shopify store with Basel — premium OS 3.0 theme with ${demo_count}+ demos, mega menu, AJAX search, and built-in bundles. Fast, mobile-first, SEO-ready.`,
  robots: "index,follow,max-image-preview:large",
  image: assetUrl("logo.png"),
};