import type { APIContext } from "astro";
import {
  DEFAULT_CITY_ID,
  LOCATIONS,
  type CityId,
  type SalonLocation,
} from "../data/locations";

export const CITY_COOKIE_NAME = "dbe_city";
export const CITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Request/response header used for CDN cache partitioning (2 variants per URL). */
export const CITY_VARY_HEADER = "X-DB-City";

/** Salon coordinates for nearest-branch detection */
const SALON_COORDS: Record<CityId, { lat: number; lon: number }> = {
  bangalore: { lat: 12.9482833, lon: 77.5755318 },
  chennai: { lat: 12.8077238, lon: 80.2267079 },
};

const CHENNAI_REGION =
  /\b(chennai|madras|tamil\s*nadu|padur|kelambakkam|omr)\b/i;
const BANGALORE_REGION =
  /\b(bangalore|bengaluru|basavanagudi|karnataka|vanivilas)\b/i;

export function isCityId(value: string | null | undefined): value is CityId {
  return value === "bangalore" || value === "chennai";
}

export function parseCityCookie(cookieHeader: string | null): CityId | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${CITY_COOKIE_NAME}=([^;]+)`),
  );
  const raw = match?.[1]?.trim();
  return isCityId(raw) ? raw : null;
}

export function cityCookieHeader(cityId: CityId): string {
  return `${CITY_COOKIE_NAME}=${cityId}; Path=/; Max-Age=${CITY_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Value for `document.cookie` (client-side city switch). */
export function cityCookieDocumentValue(cityId: CityId): string {
  return `${CITY_COOKIE_NAME}=${cityId}; path=/; max-age=${CITY_COOKIE_MAX_AGE}; samesite=lax`;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCityId(lat: number, lon: number): CityId {
  const blr = haversineKm(
    lat,
    lon,
    SALON_COORDS.bangalore.lat,
    SALON_COORDS.bangalore.lon,
  );
  const chn = haversineKm(
    lat,
    lon,
    SALON_COORDS.chennai.lat,
    SALON_COORDS.chennai.lon,
  );
  return chn < blr ? "chennai" : "bangalore";
}

interface CfGeo {
  latitude?: string | number;
  longitude?: string | number;
  city?: string;
  region?: string;
  regionCode?: string;
}

export function inferCityIdFromCf(cf: CfGeo | undefined): CityId | null {
  if (!cf) return null;

  const lat =
    typeof cf.latitude === "string" ? parseFloat(cf.latitude) : cf.latitude;
  const lon =
    typeof cf.longitude === "string" ? parseFloat(cf.longitude) : cf.longitude;

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return nearestCityId(lat!, lon!);
  }

  const text = [cf.city, cf.region, cf.regionCode].filter(Boolean).join(" ");
  if (CHENNAI_REGION.test(text)) return "chennai";
  if (BANGALORE_REGION.test(text)) return "bangalore";

  return null;
}

/** Clone request with a stable city key for Workers CDN cache (never trust client-sent value). */
export function requestWithCityVaryHeader(request: Request): Request {
  const { cityId } = resolveCityIdFromRequest(request);
  const headers = new Headers(request.headers);
  headers.set(CITY_VARY_HEADER, cityId);
  return new Request(request, { headers });
}

export function resolveCityIdFromRequest(request: Request): {
  cityId: CityId;
  setCityCookie: boolean;
} {
  const fromCookie = parseCityCookie(request.headers.get("cookie"));
  if (fromCookie) {
    return { cityId: fromCookie, setCityCookie: false };
  }

  const cf = (request as Request & { cf?: CfGeo }).cf;
  const inferred = inferCityIdFromCf(cf) ?? DEFAULT_CITY_ID;
  return { cityId: inferred, setCityCookie: true };
}

export function getActiveCityId(locals: APIContext["locals"]): CityId {
  return locals.cityId ?? DEFAULT_CITY_ID;
}

export function getActiveLocation(
  context: Pick<APIContext, "locals">,
): SalonLocation {
  return LOCATIONS[getActiveCityId(context.locals)];
}

/** Safe relative redirect target for city switcher */
export function sanitizeNextPath(next: string | null, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
