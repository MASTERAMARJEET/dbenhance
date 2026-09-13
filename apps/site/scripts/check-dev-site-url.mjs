import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DEV_EMDASH_SITE_URL } from "../config/dev.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");

if (!wrangler.includes(DEV_EMDASH_SITE_URL)) {
  console.error(
    "wrangler.jsonc env.dev.vars.EMDASH_SITE_URL must match config/dev.mjs DEV_EMDASH_SITE_URL",
  );
  process.exit(1);
}

console.log("Dev site URL matches wrangler.jsonc");
