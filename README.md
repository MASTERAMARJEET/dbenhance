# DBEnhance

Marketing site powered by [EmDash CMS](https://emdashcms.com/) on Cloudflare (Workers, D1, R2).

## Requirements

- Node.js 22.12.0 or later
- pnpm

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

## Monorepo layout

- `apps/site` — EmDash + Astro site
- `packages/` — reserved for shared packages
