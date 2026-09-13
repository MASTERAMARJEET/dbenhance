import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { DEV_EMDASH_SITE_URL } from "../config/dev.mjs";
import { PROD_EMDASH_SITE_URL } from "../config/prod.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distServer = join(root, "dist", "server");
const afterBuild = process.argv.includes("--after-build");

if (!afterBuild) {
  process.exit(0);
}

if (!existsSync(distServer)) {
  console.error("Expected dist/server after build; run astro build first.");
  process.exit(1);
}

function walk(dir, hits) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, hits);
      continue;
    }
    if (!/\.(js|mjs|json|map)$/.test(name)) continue;
    const text = readFileSync(path, "utf8");
    if (text.includes(DEV_EMDASH_SITE_URL)) {
      hits.push(path);
    }
  }
}

const hits = [];
walk(distServer, hits);

if (hits.length > 0) {
  console.error(
    `Production build contains dev EMDASH_SITE_URL (${DEV_EMDASH_SITE_URL}).`,
  );
  console.error(
    "Do not deploy this artifact to dbenhance.com — rebuild with deploy:prod.",
  );
  console.error(`Example: ${hits[0]}`);
  process.exit(1);
}

console.log(
  `Production build OK: dev site URL not found under dist/server (expect ${PROD_EMDASH_SITE_URL}).`,
);
