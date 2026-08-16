import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, kvCache, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash, { memoryCache } from "emdash/astro";

const useKvObjectCache =
  process.env.CLOUDFLARE_ENV === "remote" || !import.meta.env.DEV;

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  cache: {
    provider: cacheCloudflare(),
  },
  routeRules: {
    "/": { maxAge: 300, swr: 86400 },
    "/about": { maxAge: 300, swr: 86400 },
    "/contact": { maxAge: 300, swr: 86400 },
    "/gallery": { maxAge: 300, swr: 86400 },
    "/services": { maxAge: 300, swr: 86400 },
    "/services/**": { maxAge: 300, swr: 86400 },
    "/posts": { maxAge: 300, swr: 86400 },
    "/posts/**": { maxAge: 300, swr: 86400 },
    "/category/**": { maxAge: 300, swr: 86400 },
    "/tag/**": { maxAge: 300, swr: 86400 },
  },
  image: {
    layout: "constrained",
    responsiveStyles: true,
  },
  integrations: [
    react(),
    emdash({
      siteUrl: "https://dbenhance.com",
      database: d1({ binding: "DB", session: "auto" }),
      storage: r2({ binding: "MEDIA" }),
      objectCache: useKvObjectCache
        ? kvCache({ binding: "CACHE" })
        : memoryCache(),
    }),
  ],
  devToolbar: { enabled: false },
});
