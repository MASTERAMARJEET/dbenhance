import { defineMiddleware } from "astro:middleware";
import {
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
  response.headers.append("Vary", "Cookie");

  return response;
});
