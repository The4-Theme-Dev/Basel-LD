import { siteConfig } from "./site";

export const defaultSeo = {
  title: "Basel | Shopify Themes Premium",
  description:
    "Launch your Shopify store with Basel — premium OS 2.0 theme with 40+ demos, mega menu, AJAX search, and built-in bundles. Fast, mobile-first, SEO-ready.",
  robots: "index,follow,max-image-preview:large",
  image: new URL("/logo.png", siteConfig.siteUrl).toString(),
};

export function buildPageUrl(path: string) {
  return new URL(path, siteConfig.siteUrl).toString();
}