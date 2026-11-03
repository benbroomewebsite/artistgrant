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

### Display images and loading

The 29 original images remain archived in R2. Responsive WebP versions live under `media/display/`, with widths from 160 to 2560 pixels, capped at each source's natural width. `lib/image-variants.json` records their paths, dimensions and tiny blur placeholders; the custom Next.js image loader selects a suitable size without on-demand transformations. The intentionally cropped 2024 banner is retained as an art-directed display variant, rather than uploading a second archival original. Content hashes in filenames allow year-long immutable caching. To regenerate from the sibling `artistgrant-media-prepared` archive, run `python scripts/build_image_variants.py` with Pillow installed, upload the resulting `display-upload/` contents, and commit the updated catalogue.

On the home page, judge portraits warm in the browser cache after the page finishes loading, with two low-priority downloads at a time. This is skipped for data-saving and very slow connections. Internal navigation uses Next.js Link prefetching. Winner videos only request media when approaching the viewport, and no longer download all films on initial page load.

The reference site's MS Mincho webfont is self-hosted as a compact Latin subset in `public/fonts/artist-grant-mincho.woff2`, sourced from the existing site's custom CSS font URL. Desktop and mobile layouts follow the Squarespace reference, including the one-column mobile judges gallery and collapsible navigation.

### Editing the winner pages

Ben edits each grant year at `/keystatic`. Every save is a commit that redeploys the site, so there is no database to run. Setup and instructions: [docs/editor-setup.md](docs/editor-setup.md).

Each year is one file in `content/winners/`, an ordered list of blocks. `scripts/build-winners.mjs` runs before `dev` and `build`. It collects those files into `lib/generated/winners.json`, makes the WebP sizes of images uploaded through the editor, and leaves out anything broken with a warning in the build log, so a save cannot break the build. Restart `pnpm dev` to see an edit on the site locally.

### Domain

`www.artistgrant.co.uk` and `artistgrant.co.uk` point at this Vercel project through DNS records at Squarespace, which is still the registrar and DNS provider. Keep the domain registration active. Do not cancel the Squarespace website plan until the 2026 applications are confirmed to be stored somewhere else. If DNS moves to Cloudflare, keep the Vercel records set to DNS only.

### Updates and checks

Dependabot proposes package updates as pull requests every Monday: minor and patch versions together, each major version on its own. Other packages must have been out for three days, so a compromised release is usually withdrawn first; Next.js releases are proposed without waiting.

The Check workflow builds every pull request and every change to `main`. Merge an update once its check and the Vercel preview pass. Every morning it also checks the packages the site runs on for serious security problems; a failure emails whoever last changed its schedule. GitHub pauses scheduled workflows after 60 days without a commit; re-enable it from the Actions tab.

The site builds on Node.js 24 (`engines` in `package.json`), on Vercel and in the check. Every page is built in advance, and addresses that are not pages get the 404 page without running server code.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
