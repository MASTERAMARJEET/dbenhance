import { DEV_EMDASH_SITE_URL } from "../config/dev.mjs";

/** Env vars for Astro build / Wrangler deploy against `env.dev`. */
export function devCloudflareEnv() {
  return {
    ...process.env,
    CLOUDFLARE_ENV: "dev",
    EMDASH_SITE_URL: DEV_EMDASH_SITE_URL,
  };
}
