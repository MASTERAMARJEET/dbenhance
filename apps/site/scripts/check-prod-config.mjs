import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PROD_SITE_HOST = "dbenhance.com";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");

if (!wrangler.includes(`"pattern": "${PROD_SITE_HOST}"`)) {
  console.error(
    `wrangler.jsonc must include a custom domain route for ${PROD_SITE_HOST}`,
  );
  process.exit(1);
}

console.log("Production custom domain routes look configured in wrangler.jsonc");
