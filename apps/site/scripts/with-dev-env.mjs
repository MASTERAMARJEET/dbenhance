import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { devCloudflareEnv } from "./dev-env.mjs";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const [,, ...args] = process.argv;

if (args.length === 0) {
  console.error("Usage: node scripts/with-dev-env.mjs <command> [args...]");
  process.exit(1);
}

const [command, ...commandArgs] = args;
const result = spawnSync(command, commandArgs, {
  cwd: siteRoot,
  env: devCloudflareEnv(),
  stdio: "inherit",
});

process.exit(result.status ?? 1);
