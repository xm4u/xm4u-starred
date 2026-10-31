# xm4u · starred

A static, filterable index of the repositories [@xm4u](https://github.com/xm4u) has starred on GitHub.

**Live site:** https://xm4u.github.io/xm4u-starred/

The site is built as a single page: no hero, no backend, no runtime API calls. Repository data is fetched at build time and shipped as JSON.

## Features

- Search across repository names, descriptions, topics, tags and notes.
- Filter by category, language and tag, with live facet counts.
- Sort by recently starred, most stars, recently pushed or name.
- Group results by category, or keep a flat grid.
- Shareable filter state in the URL (`q`, `cat`, `lang`, `tag`, `sort`, `group`), preserving unrelated query parameters and URL fragments. Filter changes are grouped into one history entry so Back returns to the previous page state and Forward restores the latest selection.
- English and Spanish UI, with automatic browser language detection.
- Light, dark and system themes, persisted in `localStorage`.
- Responsive layout with a mobile filter sheet.

## Stack

- Vite 8, React 19 and TypeScript 7
- Tailwind CSS 4 and shadcn/ui (`radix-nova` style)
- i18next / react-i18next
- IBM Plex Sans and IBM Plex Mono

## Local development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/xm4u-starred/`.

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check, build and verify production CSP in `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |
| `npm test` | Run native Node.js regression tests (Vite SSR loads TypeScript) |
| `npm run sync` | Refresh starred repositories from GitHub |

## Repository data

The generated dataset lives in [`src/data/repos.json`](src/data/repos.json). To refresh it:

```bash
npm run sync
```

The script calls the GitHub starred endpoint and merges manual metadata from [`src/data/overrides.json`](src/data/overrides.json). Existing overrides win; new repositories are classified automatically using the keywords in [`src/data/categories.json`](src/data/categories.json). The file is only rewritten when repository data actually changes, so scheduled syncs do not create empty commits.

Set `GH_TOKEN` (or `GITHUB_TOKEN`) to raise the GitHub API rate limit:

```bash
GH_TOKEN=ghp_xxx npm run sync
```

### Adding a category, tag or note

Add an entry keyed by `owner/repo` in `src/data/overrides.json`:

```json
{
  "owner/repo": {
    "category": "agentes",
    "tags": ["mcp", "skills"],
    "note": "Optional short note shown on the card."
  }
}
```

Available categories: `seguridad`, `terminal`, `agentes`, `diseno`, `gestion`, `aprendizaje`, `otros`.

## Deployment

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) deploys to GitHub Pages. It runs on every push to `main`, daily at 05:17 UTC, and manually via `workflow_dispatch`.

On each run it:

1. Synchronizes starred repositories with a read-only token, validates the GitHub API response, and uploads a short-lived artifact. No dependencies are installed.
2. Validates the artifact again and commits the updated dataset in a separate job with `contents: write`, without running npm dependencies. Git authentication is provided through environment-based configuration, never command-line arguments.
3. Builds in a read-only job using `npm ci --ignore-scripts`, validates the JSON, runs tests, lint and `npm audit`, and checks the production CSP.
4. Deploys the static artifact in an isolated GitHub Pages job.

All external GitHub Actions are pinned to verified 40-character commit IDs rather than movable version tags. The initial `GITHUB_TOKEN` must allow the separate commit job to write repository contents. If `main` is branch-protected or Actions writes are disabled, automatic data commits can fail until the repository permissions are configured.

Security: the site makes no runtime GitHub API calls and uses a production-only CSP delivered through a `meta` element. GitHub Pages does not let this project configure HTTP response security headers; in particular, `frame-ancestors` cannot be enforced by a CSP meta tag. Inline styles remain allowed because the Radix components use dynamic styles; inline JavaScript is blocked.

Before the first deployment, enable Pages in the repository settings:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

The Vite base path is set to `/xm4u-starred/` in `vite.config.ts`. Change it if the repository or custom domain is renamed.

## Project structure

```text
scripts/sync.mjs          GitHub starred data sync + classification
src/components/           Header, filters, cards, grid and UI primitives
src/data/                 Generated dataset, overrides and category taxonomy
src/hooks/use-filters.ts  URL-backed filter state
src/lib/filter-url.ts     Pure URL parsing and serialization
scripts/classify.mjs      Testable category classification
scripts/validate-data.mjs Schema and destination validation for sync and CI
scripts/check-dist-security.mjs  Production CSP and asset verification
public/theme-init.js      Synchronous theme initialization without inline JavaScript
src/styles/radix-variants.css  Locally maintained Radix/Tailwind state variants
tests/core.test.mjs       Filters, URL state and classifier regression tests
src/i18n/                 English and Spanish translations
src/lib/                  Filtering, formatting, category and repo helpers
src/index.css             Palette, theme tokens and Tailwind theme
```
