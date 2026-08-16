# DBEnhance

Marketing site powered by [EmDash CMS](https://emdashcms.com/) on Cloudflare (Workers, D1, R2).

## Requirements

- Node.js 26.0.0 or later
- pnpm 11.22.0 (pinned via `packageManager` in `package.json`)

## Development

```bash
pnpm install
pnpm dev
```

The site runs at `http://localhost:4321`. Admin UI: `http://localhost:4321/_emdash/admin`.

## Build

```bash
pnpm build
```

## Deploy to Cloudflare

```bash
pnpm deploy:site
```

Requires `wrangler login` or a `CLOUDFLARE_API_TOKEN`. Set `EMDASH_ENCRYPTION_KEY` in Cloudflare Worker secrets for production.

`pnpm deploy:site` attaches `dbenhance.com` and `www.dbenhance.com` as Worker custom domains (configured in `apps/site/wrangler.jsonc`). `www` permanently redirects to the apex domain.

If the first deploy fails with a DNS conflict, delete existing apex/`www` A or CNAME records in the Cloudflare DNS zone first. Custom domains cannot be attached while those records exist.

## Monorepo layout

- `apps/site` — EmDash + Astro site
- `packages/` — reserved for shared packages
