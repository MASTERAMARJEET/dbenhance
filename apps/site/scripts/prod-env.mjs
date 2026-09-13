import { PROD_EMDASH_SITE_URL } from "../config/prod.mjs";

/** Env vars for Astro build / Wrangler deploy against production (default env). */
export function prodCloudflareEnv() {
  const { CLOUDFLARE_ENV: _dropDev, EMDASH_SITE_URL: _dropUrl, ...rest } =
    process.env;
  return {
    ...rest,
    EMDASH_SITE_URL: PROD_EMDASH_SITE_URL,
  };
}
