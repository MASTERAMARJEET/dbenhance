#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertEnvironmentConfigured,
  getEnvironmentConfig,
  readWranglerConfig,
} from "./lib/environments.mjs";
import {
  applySeedToDatabase,
  exportEnvironmentToSqlite,
  exportSeedJson,
  isPlaceholderId,
  pushAppDataToEnvironment,
  sqlPathFor,
  sqlitePathFor,
  writeSeedJson,
} from "./lib/d1-sqlite.mjs";
import {
  collectMediaReferences,
  countContentEntries,
} from "./lib/media-refs.mjs";
import { repairMediaUsage, syncReferencedMedia } from "./lib/r2-sync.mjs";
import { diffSchemas, fingerprintSchema } from "./lib/schema-fingerprint.mjs";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const siteDir = join(repoRoot, "apps/site");
const syncDir = join(repoRoot, ".prod-sync");
const wranglerPath = join(siteDir, "wrangler.jsonc");

function parseArgs(argv) {
  const options = {
    from: null,
    to: null,
    apply: false,
    force: false,
    skipMedia: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--from") {
      options.from = argv[++i];
    } else if (arg === "--to") {
      options.to = argv[++i];
    } else if (arg === "--apply") {
      options.apply = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--skip-media") {
      options.skipMedia = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (!options.from || !options.to) {
    printHelp();
    process.exit(1);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: pnpm sync:data --from <prod|dev|local> --to <prod|dev|local> [options]

Options:
  --apply       Write changes (default is dry-run)
  --force       Required with --apply when target is prod, or prod -> local
  --skip-media  Skip referenced R2 media copy even with --apply

Examples:
  pnpm sync:data --from prod --to dev
  pnpm sync:data --from prod --to dev --apply
  pnpm sync:data --from dev --to local --apply
  pnpm sync:data --from dev --to prod --apply --force
`);
}

async function confirm(message) {
  if (process.env.CONFIRM_PROD_SYNC === "1") {
    return true;
  }

  const rl = createInterface({ input, output });
  const answer = await rl.question(`${message} Type "yes" to continue: `);
  rl.close();
  return answer.trim().toLowerCase() === "yes";
}

function printHeader(fromEnv, toEnv, options) {
  console.log("");
  console.log(`Sync app data: ${fromEnv.label} -> ${toEnv.label}`);
  console.log(`Mode: ${options.apply ? "apply" : "dry-run"}`);
  console.log(`Source D1: ${fromEnv.d1.database_name}`);
  console.log(`Target D1: ${toEnv.d1.database_name}`);
  console.log(`Source R2: ${fromEnv.r2.bucket_name}`);
  console.log(`Target R2: ${toEnv.r2.bucket_name}`);
  console.log("");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const wrangler = await readWranglerConfig(wranglerPath);
  const fromEnv = getEnvironmentConfig(wrangler, options.from);
  const toEnv = getEnvironmentConfig(wrangler, options.to);

  if (fromEnv.label === toEnv.label) {
    throw new Error("Source and target must be different environments.");
  }

  assertEnvironmentConfigured(fromEnv);
  assertEnvironmentConfigured(toEnv);

  if (options.apply && toEnv.label === "prod" && !options.force) {
    throw new Error('Target is prod. Re-run with "--apply --force".');
  }

  if (
    options.apply &&
    fromEnv.label === "prod" &&
    toEnv.label === "local" &&
    !options.force
  ) {
    throw new Error('Copying prod to local requires "--apply --force".');
  }

  if (options.apply) {
    if (toEnv.label === "prod") {
      const ok = await confirm(
        "You are about to write app data to production.",
      );
      if (!ok) {
        console.log("Aborted.");
        process.exit(1);
      }
    }
    if (fromEnv.label === "prod" && toEnv.label === "local") {
      const ok = await confirm(
        "You are about to copy production app data to local.",
      );
      if (!ok) {
        console.log("Aborted.");
        process.exit(1);
      }
    }
  }

  printHeader(fromEnv, toEnv, options);

  const fromSqlPath = sqlPathFor(syncDir, `${fromEnv.label}-snapshot`);
  const fromDbPath = sqlitePathFor(syncDir, `${fromEnv.label}-snapshot`);
  const toSqlPath = sqlPathFor(syncDir, `${toEnv.label}-snapshot`);
  const toDbPath = sqlitePathFor(syncDir, `${toEnv.label}-snapshot`);

  console.log("Exporting source database snapshot...");
  await exportEnvironmentToSqlite({
    siteDir,
    env: fromEnv,
    sqlPath: fromSqlPath,
    dbPath: fromDbPath,
    syncDir,
  });

  console.log("Exporting target database snapshot...");
  await exportEnvironmentToSqlite({
    siteDir,
    env: toEnv,
    sqlPath: toSqlPath,
    dbPath: toDbPath,
    syncDir,
  });

  const sourceSchema = exportSeedJson({
    siteDir,
    dbPath: fromDbPath,
    withContent: false,
  });
  const targetSchema = exportSeedJson({
    siteDir,
    dbPath: toDbPath,
    withContent: false,
  });
  const sourceFingerprint = fingerprintSchema(sourceSchema);
  const targetFingerprint = fingerprintSchema(targetSchema);

  console.log(`Source schema fingerprint: ${sourceFingerprint}`);
  console.log(`Target schema fingerprint: ${targetFingerprint}`);

  if (sourceFingerprint !== targetFingerprint) {
    console.error("Schema mismatch. Sync aborted.");
    for (const line of diffSchemas(sourceSchema, targetSchema)) {
      console.error(`  ${line}`);
    }
    process.exit(1);
  }

  console.log("Schema match: yes");

  const sourceSeed = exportSeedJson({
    siteDir,
    dbPath: fromDbPath,
    withContent: true,
  });
  const mediaKeys = collectMediaReferences(sourceSeed);
  const contentCounts = countContentEntries(sourceSeed);

  console.log("");
  console.log("Content entry counts:");
  for (const [collection, count] of Object.entries(contentCounts)) {
    console.log(`  ${collection}: ${count}`);
  }
  console.log(`Referenced media objects: ${mediaKeys.length}`);

  if (!options.apply) {
    console.log("");
    console.log("Dry-run complete. Re-run with --apply to write app data.");
    return;
  }

  const exportPath = await writeSeedJson(syncDir, sourceSeed, "export.json");

  console.log("");
  console.log("Applying app data to target snapshot...");
  const targetWorkingDb = sqlitePathFor(syncDir, `${toEnv.label}-working`);
  await exportEnvironmentToSqlite({
    siteDir,
    env: toEnv,
    sqlPath: sqlPathFor(syncDir, `${toEnv.label}-working-source`),
    dbPath: targetWorkingDb,
    syncDir,
  });

  await applySeedToDatabase({
    siteDir,
    dbPath: targetWorkingDb,
    seedPath: exportPath,
    syncDir,
  });

  console.log("Pushing app data tables to target environment...");
  await pushAppDataToEnvironment({
    siteDir,
    env: toEnv,
    dbPath: targetWorkingDb,
    syncDir,
    label: toEnv.label,
  });

  if (!options.skipMedia) {
    console.log("Syncing referenced media objects...");
    const mediaResult = await syncReferencedMedia({
      siteDir,
      sourceEnv: fromEnv,
      targetEnv: toEnv,
      keys: mediaKeys,
      syncDir,
      dryRun: false,
    });
    console.log(
      `Media copied: ${mediaResult.copied}, skipped: ${mediaResult.skipped}`,
    );
  }

  const targetUrl =
    toEnv.label === "dev"
      ? wrangler.env?.dev?.vars?.EMDASH_SITE_URL
      : toEnv.label === "prod"
        ? "https://dbenhance.com"
        : null;

  console.log("Repairing media usage indexes...");
  repairMediaUsage({ siteDir, targetEnv: toEnv, targetUrl });

  console.log("");
  console.log("Sync complete.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
