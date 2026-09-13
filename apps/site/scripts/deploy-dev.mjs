import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { devCloudflareEnv } from "./dev-env.mjs";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: siteRoot,
    env: devCloudflareEnv(),
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("node", ["scripts/check-dev-site-url.mjs"]);
run("astro", ["build"]);
run("wrangler", ["deploy"]);
