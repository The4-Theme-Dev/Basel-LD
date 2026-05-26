import { siteConfig } from "./site";

const base = import.meta.env.BASE_URL;

function getOrigin(): string {
  return new URL(siteConfig.siteUrl).origin;
}

/** Path từ root domain, có prefix base (vd. /basel-1/logo.svg) */
export function assetPath(file: string): string {
  return `${base}${file.replace(/^\//, "")}`;
}

/** URL tuyệt đối cho OG / JSON-LD */
export function assetUrl(file: string): string {
  return new URL(assetPath(file), getOrigin()).toString();
}

/** URL canonical trang */
export function buildPageUrl(path: string): string {
  const pagePath =
    path === "/"
      ? base
      : `${base}${path.replace(/^\//, "")}`;
  return new URL(pagePath, getOrigin()).toString();
}
