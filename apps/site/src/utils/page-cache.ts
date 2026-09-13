import type { CacheHint } from "emdash";
import type { APIContext } from "astro";
import type { CityId } from "../data/locations";
import { getActiveCityId } from "./city-context";

export function withCityCacheTag(
  hint: CacheHint,
  cityId: CityId,
): CacheHint {
  const cityTag = `city:${cityId}`;
  const tags = hint.tags ?? [];
  if (tags.includes(cityTag)) return hint;
  return { ...hint, tags: [...tags, cityTag] };
}

export function setPageCache(
  Astro: APIContext,
  cacheHint: CacheHint,
): void {
  if (!Astro.cache?.enabled) return;
  Astro.cache.set(withCityCacheTag(cacheHint, getActiveCityId(Astro.locals)));
}
