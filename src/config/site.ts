/** Production URL — set PUBLIC_SITE_URL in .env (must be https://) */
const siteUrl =
  import.meta.env.SITE ||
  import.meta.env.PUBLIC_SITE_URL ||
  "https://themes.the4.co/basel-1";

export const siteConfig = {
  siteUrl,
  siteName: "Basel",
  author: "The4 Studio",
  locale: "en_US",
  themeColor: "#ffffff",
  // Money & store
  originPrice: 59,
  priceSale: 0,
  moneyPrefix: "$",
  buyUrl: "#",
  openStoreUrl: "https://shopify.pxf.io/21gPVO",
  claimDealUrl: "#",
  submitYourWebsiteUrl: "#",
  liveDemoUrl: "https://basel-v4.myshopify.com/",

  // layout/theme
  containerWidth: "1350px",
  colorBg: "rgba(240, 240, 240, 1)",
  colorText: "#000",
  colorTextSecondary: "#606060",
  colorPrimary: "#000",
  colorSecondary: "rgba(96, 96, 96, 1)",
  colorAccent: "rgba(26, 173, 163, 1)",

  containerWidthMobile: "100vw",
  gap: "15px",
  fontHeading: '"Geist", sans-serif',
  fontTitle: '"Geist", sans-serif',
  fontBody: '"Geist", sans-serif',

  buttonRadius: "8px",
  buttonBgAccent: "rgba(26, 173, 163, 1)",
  buttonTextAccent: "#fff",
  buttonBgPrimary: "rgba(0, 0, 0, 1)",
  buttonTextPrimary: "#fff",
  buttonBgTransparent: "transparent",
  buttonTextTransparent: "#000",

  headingBadgeBgPrimary: "#fff",
  headingBadgeTextPrimary: "rgba(224, 96, 27, 1)",
  headingBadgeBgAccent: "rgba(26, 173, 163, 1)",
  headingBadgeTextAccent: "#fff",
  headingBadgeRadius: "9999px",

  radiusSm: "6px",
  radius: "8px",
  radiusLg: "16px",
  radiusXl: "24px",

  sectionSpace: {
    dk: 128,
    dk2: 104,
    tb: 70,
    mb: 50,
  }
} as const;