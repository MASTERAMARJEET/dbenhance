# DBEnhance

Marketing site powered by [EmDash CMS](https://emdashcms.com/) on Cloudflare (Workers, D1, R2).

## Requirements

- Node.js 26.0.0 or later
- pnpm 11.22.0 (pinned via `packageManager` in `package.json`)
- `wrangler login` or `CLOUDFLARE_API_TOKEN` for deploy and Cloudflare operations

## Development

```bash
pnpm install
pnpm dev
```

The site runs at `http://localhost:4321`. Admin UI: `http://localhost:4321/_emdash/admin`.

`pnpm dev` uses **local** D1 and R2 (empty until you seed or add content). It does not touch production or the shared dev Worker.

To exercise real dev D1/R2/KV and the deployed dev Worker, use `pnpm deploy:site:dev` and open the workers.dev URL (see [Dev environment](#dev-environment)).

## Build

```bash
pnpm build:prod
```

Production and dev builds are both checked in CI. Dev build:

```bash
pnpm build:dev
```

## Deploy

Production:

```bash
pnpm deploy:site:prod
```

Dev (workers.dev):

```bash
pnpm deploy:site:dev
```

`deploy:site:dev` sets `CLOUDFLARE_ENV=dev` and `EMDASH_SITE_URL` from `apps/site/config/dev.mjs` for the Astro build, then runs `wrangler deploy --env dev`. **Do not** run a dev build followed by a default `wrangler deploy` — that publishes a dev-configured bundle to production.

`deploy:site:prod` clears inherited dev env vars, builds with `apps/site/config/prod.mjs`, verifies the bundle does not contain the dev URL, then deploys the default Worker.

Requires `wrangler login` or a `CLOUDFLARE_API_TOKEN`. Set `EMDASH_ENCRYPTION_KEY` in Cloudflare Worker secrets for each environment (use a **different** key for dev than production).

`pnpm deploy:site:prod` attaches `dbenhance.com` and `www.dbenhance.com` as Worker custom domains (configured in `apps/site/wrangler.jsonc`). `www` permanently redirects to the apex domain.

If the first deploy fails with a DNS conflict, delete existing apex/`www` A or CNAME records in the Cloudflare DNS zone first. Custom domains cannot be attached while those records exist.

## Dev environment

**This repo** already lists dev D1/R2/KV ids and the dev workers.dev URL in `apps/site/wrangler.jsonc` and `apps/site/config/dev.mjs`. After clone, run `pnpm deploy:site:dev` if you need to refresh the dev Worker.

### One-time setup (new Cloudflare account or reprovisioning)

From `apps/site`:

```bash
wrangler d1 create dbenhance-site-dev
wrangler r2 bucket create dbenhance-media-dev
wrangler kv namespace create CACHE --env dev
wrangler secret put EMDASH_ENCRYPTION_KEY --env dev
```

**Booking email (Cloudflare Email Service):** Onboard `dbenhance.com` under **Email Service → Email Sending**, then verify each lead inbox under **Email Routing → Destination Addresses** (`dbenhance.blr@gmail.com`, `rekha.dbenhance@gmail.com`). The Worker uses a `send_email` binding (`EMAIL`) and `BOOKING_FROM_EMAIL=bookings@dbenhance.com` from `wrangler.jsonc`; destinations must match `BOOKING_LEAD_EMAILS` in `apps/site/src/data/locations.ts`.

Copy the returned D1 UUID and KV namespace id into `apps/site/wrangler.jsonc` under `env.dev`. Set the workers.dev URL in **both** `apps/site/config/dev.mjs` and `env.dev.vars.EMDASH_SITE_URL`, then run:

```bash
pnpm check:dev-config
pnpm deploy:site:dev
```

### After deploy

1. Open the dev workers.dev URL and complete the EmDash **admin setup wizard** (separate account from production).
2. Add or migrate content (e.g. EmDash admin backup from prod, entered manually in dev).
3. In dev admin, confirm **Google Tag Manager** (or other analytics plugins) use test/dev containers so dev traffic does not hit production tags.

## Monorepo layout

- `apps/site` — EmDash + Astro site
- `packages/` — reserved for shared packages
