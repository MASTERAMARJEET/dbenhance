import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
	clearAppData,
	generateAppDataPushSql,
	getAppDataTables,
} from "./app-data-tables.mjs";

const PLACEHOLDER_ID_PREFIX = "00000000-0000-0000-0000-00000000000";

export async function exportEnvironmentToSqlite({
	siteDir,
	env,
	sqlPath,
	dbPath,
	syncDir,
}) {
	await mkdir(syncDir, { recursive: true });
	await rm(sqlPath, { force: true });
	await rm(dbPath, { force: true });

	const exportArgs = [
		"d1",
		"export",
		env.d1.database_name,
		"--output",
		sqlPath,
	];

	if (env.remote) {
		exportArgs.push("--remote");
	} else {
		exportArgs.push("--local");
	}

	if (env.wranglerEnv) {
		exportArgs.push("--env", env.wranglerEnv);
	}

	runWrangler(siteDir, exportArgs);
	importSqlite(dbPath, sqlPath);
}

export function importSqlite(dbPath, sqlPath) {
	runCommand("sqlite3", [dbPath, `.read ${sqlPath}`]);
}

export function exportSeedJson({ siteDir, dbPath, withContent = false }) {
	const args = ["exec", "emdash", "export-seed", "--database", dbPath, "--cwd", siteDir];

	if (withContent) {
		args.push("--with-content");
	}

	const result = spawnSync("pnpm", args, {
		cwd: siteDir,
		encoding: "utf8",
	});

	if (result.status !== 0) {
		throw new Error(result.stderr || result.stdout || "emdash export-seed failed");
	}

	const jsonStart = result.stdout.indexOf("{");
	if (jsonStart === -1) {
		throw new Error("emdash export-seed did not return JSON");
	}

	return JSON.parse(result.stdout.slice(jsonStart));
}

export async function applySeedToDatabase({
	siteDir,
	dbPath,
	seedPath,
	syncDir,
}) {
	const tables = getAppDataTables(dbPath);
	clearAppData(dbPath, tables);

	const result = spawnSync(
		"pnpm",
		[
			"exec",
			"emdash",
			"seed",
			seedPath,
			"--database",
			dbPath,
			"--cwd",
			siteDir,
			"--on-conflict",
			"update",
		],
		{ cwd: siteDir, encoding: "utf8" },
	);

	if (result.status !== 0) {
		throw new Error(result.stderr || result.stdout || "emdash seed failed");
	}

	return tables;
}

export async function pushAppDataToEnvironment({
	siteDir,
	env,
	dbPath,
	syncDir,
	label,
}) {
	const tables = getAppDataTables(dbPath);
	const pushSqlPath = join(syncDir, `${label}-app-data-push.sql`);
	generateAppDataPushSql(dbPath, tables, pushSqlPath);

	const executeArgs = [
		"d1",
		"execute",
		env.d1.database_name,
		"--file",
		pushSqlPath,
	];

	if (env.remote) {
		executeArgs.push("--remote");
	} else {
		executeArgs.push("--local");
	}

	if (env.wranglerEnv) {
		executeArgs.push("--env", env.wranglerEnv);
	}

	runWrangler(siteDir, executeArgs);
}

export async function writeSeedJson(syncDir, seed, name = "export.json") {
	await mkdir(syncDir, { recursive: true });
	const path = join(syncDir, name);
	await writeFile(path, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
	return path;
}

export function runWrangler(cwd, args) {
	runCommand("pnpm", ["exec", "wrangler", ...args], { cwd });
}

function runCommand(command, args, { cwd } = {}) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	if (result.status !== 0) {
		const message = result.stderr || result.stdout || `${command} failed`;
		throw new Error(message.trim());
	}

	return result;
}

export function isPlaceholderId(id) {
	return !id || id.startsWith(PLACEHOLDER_ID_PREFIX);
}

export function sqlitePathFor(syncDir, envName) {
	return join(syncDir, `${envName}.db`);
}

export function sqlPathFor(syncDir, envName) {
	return join(syncDir, `${envName}.sql`);
}
