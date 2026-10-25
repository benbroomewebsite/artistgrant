        # artistgrant

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_hA5Co4spkZ3S0kifS7kUjh2NFrXK)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Importing Squarespace media

With Python 3 and FFmpeg available, run:

```bash
python scripts/import_squarespace_media.py
```

The importer reads the live Squarespace sitemap and page blocks, downloads original images and the highest-quality self-hosted video renditions into `public/media`, and writes `public/media/manifest.json`. Public paths remain under `/media/...`, so the directory can later be mirrored to an R2 bucket without changing page content.

Media is served from Ben's `artistgrant-media` R2 bucket (Cloudflare account `856d30a7c55ce0475ebcac06e973dc57`). Its public origin is `https://pub-8a5603baa7c14b72b81d23aa7715704e.r2.dev`. Set `NEXT_PUBLIC_MEDIA_BASE_URL` to override it, and update the image hostname in `next.config.mjs` when changing origins. `lib/media-paths.json` maps the previous media paths to 33 deduplicated objects (29 images and four videos). The origin can later be replaced with `https://media.artistgrant.co.uk` once DNS and the R2 custom domain are configured.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
