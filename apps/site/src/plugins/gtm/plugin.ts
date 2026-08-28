import { definePlugin } from "emdash";

export function createPlugin() {
  return definePlugin({
    id: "gtm",
    version: "1.0.0",
    capabilities: ["hooks.page-fragments:register"],

    admin: {
      settingsSchema: {
        gtmContainerId: {
          type: "string",
          label: "GTM Container ID",
          description: "e.g. GTM-XXXXXXX",
        },
        enabled: {
          type: "boolean",
          label: "Enabled",
          default: true,
        },
      },
    },

    hooks: {
      "page:fragments": async (_event, ctx) => {
        const enabled = (await ctx.kv.get<boolean>("settings:enabled")) ?? true;
        const containerId = (
          await ctx.kv.get<string>("settings:gtmContainerId")
        )?.trim();
        if (!enabled || !containerId) return null;

        return [
          {
            kind: "inline-script" as const,
            placement: "head" as const,
            key: "gtm-bootstrap",
            code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(containerId)});`,
          },
          {
            kind: "html" as const,
            placement: "body:start" as const,
            key: "gtm-noscript",
            html: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
          },
        ];
      },
    },
  });
}

export default createPlugin;
