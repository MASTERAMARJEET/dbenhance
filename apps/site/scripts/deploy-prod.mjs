import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { prodCloudflareEnv } from "./prod-env.mjs";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: siteRoot,
    env: prodCloudflareEnv(),
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("node", ["scripts/check-prod-config.mjs"]);
run("astro", ["build"]);
run("node", ["scripts/check-build-site-url.mjs", "--after-build"]);
run("wrangler", ["deploy"]);
