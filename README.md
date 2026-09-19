# SelfAwareGrid &mdash; demo site

The demo site for [`self-aware-grid`](https://www.npmjs.com/package/self-aware-grid), a dependency-free library
that measures a CSS grid as it reflows and gives every child an awareness of its own position.

**Live:** <https://jaidendechon.github.io/SelfAwareGrid-Demo/>

## What it demonstrates

- **Style rows and columns easily.** Resize the grid container and watch SelfAwareGrid retag the top row, bottom
  row and outer columns as the grid reflows. Tap any cell to read `isTopRow`, `isNthRow`, `isNthColumn` and
  friends straight off the live instance.
- **Navigate a grid like a spreadsheet.** Arrow keys walk the grid vertically and horizontally using
  `getGridItemAbove` / `Below` / `ToTheLeft` / `ToTheRight`. An on-screen arrow pad covers touch devices, which
  have no arrow keys.

## Docs

The documentation section is the package's own README, imported straight from the installed copy of
`self-aware-grid` (`src/docs.ts`) and rendered with [marked](https://marked.js.org). Bumping the dependency
updates the docs with it, so the page can never drift from the version it demonstrates.

Only two things are dropped: the README's title and intro, which the page's hero already quotes verbatim, and its
two "see the demo" links, which point back at this page. Everything else is rendered word for word.

### Resizing on mobile

`resize: horizontal` is ignored by mobile browsers &mdash; on iOS Safari there is no grab handle at all. The demo
therefore ships its own handle built on pointer events (`setPointerCapture` plus `touch-action: none`, so the drag
is not mistaken for a page scroll), keyboard support on the handle itself, and a range slider as an equally
capable alternative on a phone.

## Stack

Vite, Vue 3, TypeScript and Tailwind CSS v4. The blue is `#007BFF`, the same one used across
[jaiden.dev](https://jaiden.dev).

## Local development

```bash
npm install
npm run dev      # http://localhost:5173/SelfAwareGrid-Demo/
npm run build    # type-check, then build to dist/
npm run preview  # serve the production build
```

`vite.config.ts` sets `base` to `/SelfAwareGrid-Demo/` so the built asset URLs line up with GitHub Pages; dev and
preview use the same base. Setting `BASE_PATH` overrides it, which is how the preview workflow builds a PR for its
deeper `/pr-preview/pr-<number>/` URL.

## Share card

`public/social-preview.png` is the Open Graph / Twitter card, at the standard 1200x630. It is generated, not
hand-drawn: `tools/social-preview.html` is a standalone page using the site's own tokens, fonts and hero
motifs &mdash; including a real Conway board from a fixed seed, so regenerating produces the same image &mdash;
and `tools/social-preview.mjs` screenshots it.

```bash
npm run social-preview   # needs Playwright available; it is not a project dependency
```

Run it after changing anything the card shows. The script downloads the web fonts and inlines them before
rendering, and fails if they are missing, because a screenshot taken before the fonts arrive produces a
fallback-serif image that looks almost right.

`og:image` has to be an absolute URL, so it points at the canonical site rather than at whichever deployment
is serving the page &mdash; a pull-request preview will therefore show the card from `main`.

## CI and deployment

Everything is published to the `gh-pages` branch, which GitHub Pages serves:

| Workflow | Runs on | Does |
| --- | --- | --- |
| `build.yml` | every pull request | `npm ci` and `npm run build`, so a broken build or a type error (`npm run build` runs `vue-tsc` first) is caught on the PR rather than on `main` |
| `preview.yml` | pull requests opened, reopened, pushed to, closed | builds the PR and publishes it to `pr-preview/pr-<number>/`, comments the URL, and removes the preview when the PR closes |
| `deploy.yml` | pushes to `main` | builds and publishes to the root of `gh-pages` |

So a pull request can be viewed, running, at
`https://jaidendechon.github.io/SelfAwareGrid-Demo/pr-preview/pr-<number>/` before it is merged.

Two things make that co-existence work, and both are load-bearing: the `main` deploy passes
`clean-exclude: pr-preview/` so clearing the old build does not take the previews with it, and `force: false` so
it rebases rather than force-pushing over them.

### Repository settings

- **Settings → Pages → Build and deployment → Source**: *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`.
- **Settings → Actions → General → Workflow permissions**: the workflows request `contents: write` explicitly, but
  if a deploy is rejected for permissions, set this to *Read and write permissions*.

A pull request from a fork gets a read-only token and so cannot publish a preview; `preview.yml` skips those, and
`build.yml` still checks them.

## License

MIT &mdash; see [LICENSE](./LICENSE).
