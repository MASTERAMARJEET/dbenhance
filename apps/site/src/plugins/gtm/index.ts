import { fileURLToPath } from "node:url";
import type { PluginDescriptor } from "emdash";

/** Build-time descriptor only — not bundled into the Worker. */
export function gtmPlugin(): PluginDescriptor {
	return {
		id: "gtm",
		version: "1.0.0",
		format: "native",
		entrypoint: fileURLToPath(new URL("./plugin.ts", import.meta.url)),
		capabilities: ["hooks.page-fragments:register"],
	};
}
