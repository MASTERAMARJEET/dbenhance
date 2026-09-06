import { readFile } from "node:fs/promises";

export async function readWranglerConfig(path) {
	const raw = await readFile(path, "utf8");
	const json = raw
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/^\s*\/\/.*$/gm, "");
	return JSON.parse(json);
}

export function getEnvironmentConfig(wrangler, name) {
	if (name === "prod") {
		return {
			label: "prod",
			wranglerEnv: null,
			d1: wrangler.d1_databases?.[0],
			r2: wrangler.r2_buckets?.[0],
			kv: wrangler.kv_namespaces?.[0],
			remote: true,
		};
	}

	if (name === "dev") {
		const env = wrangler.env?.dev;
		if (!env) {
			throw new Error("Missing env.dev in apps/site/wrangler.jsonc");
		}
		return {
			label: "dev",
			wranglerEnv: "dev",
			d1: env.d1_databases?.[0],
			r2: env.r2_buckets?.[0],
			kv: env.kv_namespaces?.[0],
			remote: true,
		};
	}

	if (name === "local") {
		return {
			label: "local",
			wranglerEnv: null,
			d1: wrangler.d1_databases?.[0],
			r2: wrangler.r2_buckets?.[0],
			kv: wrangler.kv_namespaces?.[0],
			remote: false,
		};
	}

	throw new Error(`Unknown environment "${name}". Use prod, dev, or local.`);
}

export function assertEnvironmentConfigured(env) {
	if (!env.d1?.database_name) {
		throw new Error(`D1 database_name missing for ${env.label}`);
	}

	if (env.label === "dev" && isPlaceholderId(env.d1.database_id)) {
		throw new Error(
			"Dev D1 database_id is not configured. Provision dev resources and update apps/site/wrangler.jsonc.",
		);
	}
}

function isPlaceholderId(id) {
	return !id || id.startsWith("00000000-0000-0000-0000-00000000000");
}
