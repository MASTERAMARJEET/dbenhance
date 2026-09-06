import siteImages from "../data/site-images.json";
import type { ServiceCategory } from "./service-categories";
import { SOCIAL_LINKS } from "../data/locations";

export const INSTAGRAM_PROFILE = SOCIAL_LINKS.instagram;

export interface ImageAsset {
  src: string;
  alt: string;
  position?: string;
}

type PageImageKey = keyof typeof siteImages.pages;

function instagramSrc(shortcode: string): string {
  return (
    siteImages.instagram[shortcode as keyof typeof siteImages.instagram] ?? ""
  );
}

function serviceSrc(key: keyof typeof siteImages.services): string {
  return siteImages.services[key];
}

function mosaicSrc(panel: { serviceKey?: string; shortcode?: string }): string {
  if (panel.serviceKey === "hair-weaving") {
    return instagramSrc("DbIq3RrJIsY");
  }
  if (panel.serviceKey && panel.serviceKey in siteImages.services) {
    return serviceSrc(panel.serviceKey as keyof typeof siteImages.services);
  }
  if (panel.shortcode) return instagramSrc(panel.shortcode);
  return "";
}

/** Resolve a page hero or inline image key from site-images.json. */
export function getPageImage(key: PageImageKey): string {
  const value = siteImages.pages[key];
  if (typeof value === "string") return instagramSrc(value);
  return "";
}

/** Representative imagery per service category. */
export const CATEGORY_IMAGES: Record<ServiceCategory, ImageAsset> = {
  "salon-hair": {
    src: serviceSrc("salon-hair"),
    alt: "Hair styling at DB Enhance salon",
    position: "center center",
  },
  "hair-fixing": {
    src: serviceSrc("hair-fixing"),
    alt: "Non-surgical hair system application at DB Enhance",
    position: "center 30%",
  },
  nail: {
    src: serviceSrc("nail-art"),
    alt: "Nail art by DB Enhance",
    position: "center center",
  },
  skin: {
    src: serviceSrc("skin-facial"),
    alt: "Facial and skin care treatment",
    position: "center center",
  },
  grooming: {
    src: serviceSrc("grooming-bridal"),
    alt: "Bridal makeup and occasion grooming",
    position: "center center",
  },
};

/** OG / social preview image (independent of service cards). */
export const HERO_IMAGE = siteImages.hero.og;

/** Full-width mosaic panels for the homepage hero — one image per major service. */
export const HERO_MOSAIC: readonly ImageAsset[] = siteImages.hero.mosaic.map(
  (panel) => ({
    src: mosaicSrc(panel),
    alt: panel.alt,
    position: panel.position,
  }),
);

/** About page collage: Hair Patch, Extension, Nail Care, Bridal Make Up. */
export const ABOUT_SERVICE_COLLAGE: readonly ImageAsset[] = [
  {
    src: serviceSrc("hair-fixing"),
    alt: "Hair Patch at DB Enhance",
    position: "center 30%",
  },
  {
    src: instagramSrc("DbIq3RrJIsY"),
    alt: "Hair Extension at DB Enhance",
    position: "center 35%",
  },
  {
    src: serviceSrc("nail-manicure"),
    alt: "Nail Care at DB Enhance",
    position: "center center",
  },
  {
    src: serviceSrc("grooming-bridal"),
    alt: "Bridal Make Up at DB Enhance",
    position: "center center",
  },
];

/** Per-service imagery overrides — only where different from the category default. */
const SERVICE_IMAGES: Record<string, ImageAsset> = {
  "hair-cuts-styling": {
    src: instagramSrc("Da5NrCOpCUo"),
    alt: "Hair cut and blow dry styling",
    position: "center 25%",
  },
  "hair-colouring": {
    src: instagramSrc("DaK3dzwpNgr"),
    alt: "Hair colouring and styling result",
    position: "center 20%",
  },
  "hair-smoothing-forms": {
    src: instagramSrc("DaDIkeWJE44"),
    alt: "Hair smoothing and finishing",
    position: "center 30%",
  },
  "hair-weaving": {
    src: instagramSrc("DbIq3RrJIsY"),
    alt: "Hair weaving in salon",
    position: "center 35%",
  },
  "hair-clipping": {
    src: instagramSrc("DbQaOGppSXo"),
    alt: "Hair clipping system",
    position: "center 30%",
  },
  "hair-toppers": {
    src: instagramSrc("DaAockypFYT"),
    alt: "Hair toppers",
    position: "center 35%",
  },
  "hair-fall-control": {
    src: instagramSrc("DbQaOGppSXo"),
    alt: "Hair fall control consultation",
    position: "center 30%",
  },
  "hair-fixing-maintenance": {
    src: instagramSrc("Da5NrCOpCUo"),
    alt: "Hair fixing maintenance and styling",
    position: "center 25%",
  },
  "manicure-pedicure": {
    src: serviceSrc("nail-manicure"),
    alt: "Manicure and pedicure",
    position: "center center",
  },
  "gel-polish-removal": {
    src: serviceSrc("nail-manicure"),
    alt: "Gel polish removal",
    position: "center center",
  },
  "acrylic-refill": {
    src: serviceSrc("nail-manicure"),
    alt: "Acrylic refill",
    position: "center center",
  },
  "mens-grooming": {
    src: instagramSrc("Da5NrCOpCUo"),
    alt: "Men's grooming",
    position: "center 25%",
  },
};

export function getServiceImage(
  slug: string,
  category?: string | null,
): ImageAsset {
  if (SERVICE_IMAGES[slug]) return SERVICE_IMAGES[slug];

  const categoryKey = category as ServiceCategory | undefined;
  if (categoryKey && CATEGORY_IMAGES[categoryKey]) {
    return CATEGORY_IMAGES[categoryKey];
  }

  return CATEGORY_IMAGES["salon-hair"];
}
