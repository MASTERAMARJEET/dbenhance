import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const PROTECTED_EXACT = new Set([
	"users",
	"credentials",
	"auth_tokens",
	"oauth_accounts",
	"allowed_domains",
	"auth_challenges",
	"api_tokens",
	"oauth_tokens",
	"authorization_codes",
	"oauth_clients",
	"device_codes",
	"migrations",
	"_emdash_migrations",
	"audit_logs",
	"_emdash_collections",
	"_emdash_fields",
	"_emdash_byline_fields",
	"_plugin_storage",
	"_plugin_state",
	"_plugin_indexes",
	"_emdash_api_tokens",
	"_emdash_device_codes",
	"_emdash_oauth_tokens",
	"_emdash_authorization_codes",
	"_emdash_oauth_clients",
	"rate_limits",
]);

const PROTECTED_PREFIXES = ["sqlite_", "_emdash_plugin", "_emdash_encrypted"];

const APP_DASH_TABLES = new Set([
	"_emdash_taxonomy_defs",
	"_emdash_menus",
	"_emdash_menu_items",
	"_emdash_widget_areas",
	"_emdash_widgets",
	"_emdash_redirects",
	"_emdash_bylines",
	"_emdash_content_bylines",
	"_emdash_byline_field_values",
	"_emdash_byline_field_group_values",
	"_emdash_sections",
	"_emdash_comments",
	"_emdash_comment_reactions",
	"_emdash_media_usage",
	"_emdash_media_usage_sources",
	"_emdash_media_usage_index_status",
	"_emdash_media_upload_attempts",
	"_emdash_content_references",
	"_emdash_relations",
	"_emdash_revision_prune_queue",
]);

const APP_PLAIN_TABLES = new Set([
	"media",
	"taxonomies",
	"content_taxonomies",
	"revisions",
	"options",
]);

export function listSqliteTables(dbPath) {
	const result = spawnSync(
		"sqlite3",
		[dbPath, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"],
		{ encoding: "utf8" },
	);

	if (result.status !== 0) {
		throw new Error(result.stderr || "Failed to list sqlite tables");
	}

	return result.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

export function isProtectedTable(name) {
	if (PROTECTED_EXACT.has(name)) {
		return true;
	}
	return PROTECTED_PREFIXES.some((prefix) => name.startsWith(prefix));
}

export function getAppDataTables(dbPath) {
	return listSqliteTables(dbPath).filter((name) => {
		if (isProtectedTable(name)) {
			return false;
		}
		if (name.startsWith("ec_")) {
			return true;
		}
		return APP_DASH_TABLES.has(name) || APP_PLAIN_TABLES.has(name);
	});
}

function deleteStatement(table) {
	if (table === "options") {
		return "DELETE FROM options WHERE name LIKE 'site:%';";
	}
	return `DELETE FROM "${table}";`;
}

function dumpTable(dbPath, table) {
	const query =
		table === "options"
			? `SELECT * FROM options WHERE name LIKE 'site:%';`
			: `SELECT * FROM "${table}";`;

	const dump = spawnSync(
		"sqlite3",
		[dbPath, `.mode insert "${table}"`, query],
		{ encoding: "utf8" },
	);

	if (dump.status !== 0) {
		throw new Error(dump.stderr || `Failed to dump ${table}`);
	}

	return dump.stdout.trim();
}

export function clearAppData(dbPath, tables) {
	const statements = ["PRAGMA foreign_keys=OFF;"];
	for (const table of tables) {
		statements.push(deleteStatement(table));
	}
	statements.push("PRAGMA foreign_keys=ON;");

	const result = spawnSync("sqlite3", [dbPath, statements.join("\n")], {
		encoding: "utf8",
	});

	if (result.status !== 0) {
		throw new Error(result.stderr || `Failed to clear app data in ${dbPath}`);
	}
}

export function generateAppDataPushSql(dbPath, tables, outputPath) {
	const chunks = ["PRAGMA foreign_keys=OFF;"];

	for (const table of [...tables].reverse()) {
		chunks.push(deleteStatement(table));
	}

	for (const table of tables) {
		const dump = dumpTable(dbPath, table);
		if (dump) {
			chunks.push(dump);
		}
	}

	chunks.push("PRAGMA foreign_keys=ON;");
	writeFileSync(outputPath, `${chunks.join("\n")}\n`, "utf8");
}
