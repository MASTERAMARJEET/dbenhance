# DBEnhance

Marketing site powered by [EmDash CMS](https://emdashcms.com/) on Cloudflare (Workers, D1, R2).

## Requirements

- Node.js 26.0.0 or later
- pnpm 11.22.0 (pinned via `packageManager` in `package.json`)
- `wrangler login` or `CLOUDFLARE_API_TOKEN` for remote operations

## Development

```bash
pnpm install
pnpm dev
```

The site runs at `http://localhost:4321`. Admin UI: `http://localhost:4321/_emdash/admin`.

`pnpm dev` uses local D1 and R2 (empty until you add data). To run local code against the **dev** Cloudflare environment (not production):

```bash
pnpm dev:remote
```

Stop `pnpm dev` first — both use port `4321`. Requires `wrangler login` or a `CLOUDFLARE_API_TOKEN`. Copy the dev `EMDASH_ENCRYPTION_KEY` Worker secret into `apps/site/.dev.vars` so encrypted plugin secrets decrypt.

**Writes go to dev D1/R2**, not production. Use ordinary `pnpm dev` when you want a fully local sandbox.

Do not run `wrangler deploy --env dev` until dev resources are provisioned (see below).

## Build

```bash
pnpm build
```

## Deploy

Production:

```bash
pnpm deploy:site
```

Dev (workers.dev):

```bash
pnpm deploy:dev
```

`deploy:dev` sets `CLOUDFLARE_ENV=dev` for both build and deploy so Wrangler uses the flattened `env.dev` bindings (requires Wrangler 4.11+). Do not pass `--config dist/server/wrangler.json` manually.

Requires `wrangler login` or a `CLOUDFLARE_API_TOKEN`. Set `EMDASH_ENCRYPTION_KEY` in Cloudflare Worker secrets for each environment.

`pnpm deploy:site` attaches `dbenhance.com` and `www.dbenhance.com` as Worker custom domains (configured in `apps/site/wrangler.jsonc`). `www` permanently redirects to the apex domain.

If the first deploy fails with a DNS conflict, delete existing apex/`www` A or CNAME records in the Cloudflare DNS zone first. Custom domains cannot be attached while those records exist.

## Dev environment setup (one-time)

From `apps/site`:

```bash
wrangler d1 create dbenhance-site-dev
wrangler r2 bucket create dbenhance-media-dev
wrangler kv namespace create CACHE --env dev
wrangler secret put EMDASH_ENCRYPTION_KEY --env dev
wrangler secret put RESEND_API_KEY --env dev   # optional
```

Copy the returned D1 UUID and KV namespace id into `apps/site/wrangler.jsonc` under `env.dev`, replacing the placeholder ids.

Deploy dev, note the workers.dev URL, set `EMDASH_SITE_URL` in `env.dev.vars`, then redeploy:

```bash
pnpm deploy:dev
```

Create a separate dev admin account via the EmDash setup wizard on the workers.dev URL. Seed or enter content in dev as needed (EmDash admin backup download on prod is one option for manual migration).

## Monorepo layout

- `apps/site` — EmDash + Astro site
- `packages/` — reserved for shared packages
