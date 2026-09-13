import type { APIRoute } from "astro";
import {
  cityCookieHeader,
  isCityId,
  sanitizeNextPath,
} from "../../utils/city-context";

export const GET: APIRoute = ({ url }) => {
  const id = url.searchParams.get("id");
  const next = sanitizeNextPath(url.searchParams.get("next"));

  if (!isCityId(id)) {
    return new Response("Invalid city", { status: 400 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: next,
      "Set-Cookie": cityCookieHeader(id),
      "Cache-Control": "no-store",
    },
  });
};
