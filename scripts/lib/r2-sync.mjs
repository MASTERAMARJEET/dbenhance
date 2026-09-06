import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { runWrangler } from "./d1-sqlite.mjs";

export async function syncReferencedMedia({
	siteDir,
	sourceEnv,
	targetEnv,
	keys,
	syncDir,
	dryRun,
}) {
	if (keys.length === 0) {
		return { copied: 0, skipped: 0 };
	}

	const stagingDir = join(syncDir, "media-staging");
	await rm(stagingDir, { recursive: true, force: true });
	await mkdir(stagingDir, { recursive: true });

	let copied = 0;
	let skipped = 0;

	for (const key of keys) {
		const safeName = key.replace(/[^\w.-]+/g, "_");
		const localFile = join(stagingDir, safeName);

		if (dryRun) {
			copied += 1;
			continue;
		}

		try {
			runWrangler(siteDir, [
				"r2",
				"object",
				"get",
				sourceEnv.r2.bucket_name,
				key,
				"--file",
				localFile,
				...(sourceEnv.remote ? ["--remote"] : ["--local"]),
				...(sourceEnv.wranglerEnv ? ["--env", sourceEnv.wranglerEnv] : []),
			]);

			runWrangler(siteDir, [
				"r2",
				"object",
				"put",
				targetEnv.r2.bucket_name,
				key,
				"--file",
				localFile,
				...(targetEnv.remote ? ["--remote"] : ["--local"]),
				...(targetEnv.wranglerEnv ? ["--env", targetEnv.wranglerEnv] : []),
			]);

			copied += 1;
		} catch (error) {
			skipped += 1;
			await writeFile(
				join(syncDir, "media-errors.log"),
				`${key}: ${error.message}\n`,
				{ flag: "a" },
			);
		}
	}

	return { copied, skipped };
}

export function repairMediaUsage({ siteDir, targetEnv, targetUrl }) {
	if (targetUrl) {
		const result = spawnSync(
			"pnpm",
			["exec", "emdash", "media", "repair-usage", "--all", "--url", targetUrl],
			{ cwd: siteDir, encoding: "utf8" },
		);
		if (result.status !== 0) {
			throw new Error(result.stderr || result.stdout || "media repair-usage failed");
		}
		return;
	}

	const args = ["exec", "emdash", "media", "repair-usage", "--all"];
	if (targetEnv.remote) {
		// Remote repair requires a running instance URL; local Miniflare can use default localhost.
		args.push("--url", "http://localhost:4321");
	}

	const result = spawnSync("pnpm", args, { cwd: siteDir, encoding: "utf8" });
	if (result.status !== 0) {
		console.warn(result.stderr || result.stdout || "media repair-usage skipped");
	}
}
