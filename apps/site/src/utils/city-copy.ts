import type { CityId } from "../data/locations";

interface CityPageCopy {
  homeTitle: string;
  homeDescription: string;
  homeAboutLead: string;
  homeCtaLine: string;
  aboutDescription: string;
  aboutHeroLead: string;
  aboutFallbackParagraphs: string[];
  servicesDescription: string;
  galleryDescription: string;
  galleryHeroLead: string;
  contactDescription: string;
  contactHeroLead: string;
}

const COPY: Record<CityId, CityPageCopy> = {
  bangalore: {
    homeTitle: "DB Enhance — Hair, Nail & Salon in Bangalore",
    homeDescription:
      "DB Enhance in Basavanagudi, Bengaluru — hair styling, non-surgical hair fixing, nail art, facials, waxing, and bridal packages. Book your appointment today.",
    homeAboutLead:
      "Expert hair artists, nail technicians, and skin care specialists at our Basavanagudi salon — plus a full-service branch in Chennai.",
    homeCtaLine:
      "Call us or visit our Bangalore salon on Vanivilas Road. We also welcome you at our Chennai branch.",
    aboutDescription:
      "Learn about DB Enhance in Bangalore — full-service unisex salon in Basavanagudi with hair fixing, nail care, bridal makeup, and everyday salon services.",
    aboutHeroLead:
      "The Unisex Salon — your destination for complete personal care in Basavanagudi, Bengaluru.",
    aboutFallbackParagraphs: [
      "DB Enhance — The Unisex Salon — is your destination for complete personal care in Bangalore. From non-surgical hair fixing and extensions to nail care, bridal makeup, and everyday salon services, we focus on results that feel natural and polished.",
      "Visit us at 1st Floor, 34/1, Vanivilas Rd, Basavanagudi — or our Chennai branch in Padur for the same brand standard.",
    ],
    servicesDescription:
      "Explore DB Enhance services in Bangalore — salon hair care, non-surgical hair fixing, nail art, facials, waxing, makeup, and bridal packages.",
    galleryDescription:
      "Browse hair styling, nail care, makeup, and salon transformations from DB Enhance in Bangalore and Chennai.",
    galleryHeroLead:
      "Hair patch, extensions, nail care, bridal makeup, and more — featuring work from our Bangalore salon and Chennai branch.",
    contactDescription:
      "Get in touch with DB Enhance in Bangalore (Basavanagudi) and Chennai. Call, WhatsApp, or visit either salon to book hair, nail, or beauty services.",
    contactHeroLead:
      "Book an appointment at our Bangalore salon on Vanivilas Road, ask about services, or enquire about bridal and package options.",
  },
  chennai: {
    homeTitle: "DB Enhance — Hair, Nail & Salon in Chennai",
    homeDescription:
      "DB Enhance on OMR, Padur, Chennai — hair styling, non-surgical hair fixing, nail art, facials, waxing, and bridal packages. Book your appointment today.",
    homeAboutLead:
      "Expert hair artists, nail technicians, and skin care specialists at our Padur salon — plus a full-service branch in Bangalore.",
    homeCtaLine:
      "Call us or visit our Chennai salon on Rajiv Gandhi Salai. We also welcome you at our Bangalore branch.",
    aboutDescription:
      "Learn about DB Enhance in Chennai — full-service unisex salon in Padur with hair fixing, nail care, bridal makeup, and everyday salon services.",
    aboutHeroLead:
      "The Unisex Salon — your destination for complete personal care in Padur, Chennai.",
    aboutFallbackParagraphs: [
      "DB Enhance — The Unisex Salon — is your destination for complete personal care in Chennai. From non-surgical hair fixing and extensions to nail care, bridal makeup, and everyday salon services, we focus on results that feel natural and polished.",
      "Visit us at Godrej Azure Elsa Plaza, Padur — or our Bangalore branch in Basavanagudi for the same brand standard.",
    ],
    servicesDescription:
      "Explore DB Enhance services in Chennai — salon hair care, non-surgical hair fixing, nail art, facials, waxing, makeup, and bridal packages.",
    galleryDescription:
      "Browse hair styling, nail care, makeup, and salon transformations from DB Enhance in Chennai and Bangalore.",
    galleryHeroLead:
      "Hair patch, extensions, nail care, bridal makeup, and more — featuring work from our Chennai salon and Bangalore branch.",
    contactDescription:
      "Get in touch with DB Enhance in Chennai (Padur) and Bangalore. Call, WhatsApp, or visit either salon to book hair, nail, or beauty services.",
    contactHeroLead:
      "Book an appointment at our Chennai salon on Rajiv Gandhi Salai, ask about services, or enquire about bridal and package options.",
  },
};

export function getCityCopy(cityId: CityId): CityPageCopy {
  return COPY[cityId];
}
