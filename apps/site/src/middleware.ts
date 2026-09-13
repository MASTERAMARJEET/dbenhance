import { defineMiddleware } from "astro:middleware";
import {
  CITY_VARY_HEADER,
  cityCookieHeader,
  resolveCityIdFromRequest,
} from "./utils/city-context";

export const onRequest = defineMiddleware(async (context, next) => {
  const { cityId, setCityCookie } = resolveCityIdFromRequest(context.request);
  context.locals.cityId = cityId;
  context.locals.setCityCookie = setCityCookie;

  const response = await next();

  if (setCityCookie) {
    response.headers.append("Set-Cookie", cityCookieHeader(cityId));
  }

  // Two CDN variants per URL (bangalore | chennai). Worker sets CITY_VARY_HEADER on the request.
  response.headers.set("Vary", CITY_VARY_HEADER);

  return response;
});
