import type { CityId } from "../data/locations";

/** Gallery `location` field: bangalore | chennai | both | unset */
export function matchesGalleryLocation(
  location: string | null | undefined,
  cityId: CityId,
): boolean {
  if (!location) return true;
  if (location === "both") return true;
  return location === cityId;
}

/** Testimonial `location` field: bangalore | chennai | unset */
export function matchesTestimonialLocation(
  location: string | null | undefined,
  cityId: CityId,
): boolean {
  if (!location) return true;
  return location === cityId;
}
