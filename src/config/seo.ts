import { siteConfig } from "./site";

export const defaultSeo = {
  title: "Basel | Shopify Themes Premium",
  description:
    "Create a beautiful and functional online store with free or premium Shopify themes and templates. Mobile-friendly, responsive, and SEO-optimized.",
  robots: "index,follow,max-image-preview:large",
  image: new URL("/logo.png", siteConfig.siteUrl).toString(),
};

export function buildPageUrl(path: string) {
  return new URL(path, siteConfig.siteUrl).toString();
}