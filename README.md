# kcamel.com

The default website is the scrolling biology portfolio in `cell-portfolio/`.
The repository-root Vite configuration serves and builds that site. The older
pink-cell site remains in source for reference and is excluded from this build.

## Run locally

From the repository root:

```sh
npm install
npm run dev
```

The development server runs at http://127.0.0.1:5174/.

## Build and check

```sh
npm run build
npm test
npm run preview
```

`npm run build` writes the complete new website to the repository-root `dist/`
folder, including its JavaScript, styles, fonts, and favicon. No root-directory
override or manual file copying is needed.

## Cloudflare Workers

Connect `souuk/kcamel.com` with these build settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root (leave the override blank) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

The checked-in `wrangler.jsonc` deploys `dist/` to the existing `kcamel-test`
Worker and enables its `workers.dev` address. It also works with the previously
configured explicit `--assets ./dist --name kcamel-test` deploy command.
Manage custom domains in the Cloudflare dashboard. If changing the Worker name,
update `name` in `wrangler.jsonc` to match.

## Edit content

- `cell-portfolio/src/content.js`: name, introduction, projects, experience,
  academics, and contact information. Replace bracketed placeholders with facts.
- `cell-portfolio/src/style.css`: layout and appearance.
- `cell-portfolio/src/scene.js` and `choreography.js`: cell illustration and motion.
- `cell-portfolio/public/`: project images, optional résumé, and favicon.

See [the portfolio guide](cell-portfolio/README.md) for its full behavior and
accessibility notes. Running commands directly inside `cell-portfolio/` remains
supported, but that standalone build writes to `cell-portfolio/dist/`.

## Attribution

The original reference composition, reused fonts, texture, and reference assets
are attributable to Shiyun Lu and their respective owners. Source URLs remain in
`public/asset-provenance.json`. Check font licenses before redistribution. The new
cell illustration uses locally authored procedural geometry and inline SVG.
