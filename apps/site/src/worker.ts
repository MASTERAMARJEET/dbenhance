// Worker entry: Astro's fetch handler plus EmDash's scheduled() handler, which
// the Cron Trigger in wrangler.jsonc drives. PluginBridge is the sandbox
// Durable Object, re-exported here so its binding resolves.
import emdash, { PluginBridge } from "@emdash-cms/cloudflare/worker";

const APEX_HOST = "dbenhance.com";
const WWW_HOST = `www.${APEX_HOST}`;

export default {
	...emdash,
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);
		if (url.hostname === WWW_HOST) {
			url.hostname = APEX_HOST;
			url.protocol = "https:";
			return Response.redirect(url.toString(), 301);
		}
		return emdash.fetch(request, env, ctx);
	},
};

export { PluginBridge };
