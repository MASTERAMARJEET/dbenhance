import { defineMiddleware } from "astro:middleware";
import {
  cityCookieHeader,
  parseCityCookie,
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

  const hasCityPreference = Boolean(
    parseCityCookie(context.request.headers.get("cookie")) || setCityCookie,
  );
  if (hasCityPreference) {
    response.headers.set("Vary", "Cookie");
    response.headers.set(
      "Cache-Control",
      "private, no-cache, must-revalidate",
    );
  }

  return response;
});
