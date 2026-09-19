# SelfAwareGrid &mdash; demo site

The demo site for [`self-aware-grid`](https://www.npmjs.com/package/self-aware-grid), a dependency-free library
that measures a CSS grid as it reflows and gives every child an awareness of its own position.

**Live:** <https://jaidendechon.github.io/SelfAwareGrid-Demo/>

## What it demonstrates

- **Positional classnames.** Resize the grid container and watch SelfAwareGrid retag the top row, bottom row and
  outer columns as the grid reflows. Tap any cell to read `isTopRow`, `isNthRow`, `isNthColumn` and friends
  straight off the live instance.
- **Spreadsheet-style navigation.** Arrow keys walk the grid vertically and horizontally using
  `getGridItemAbove` / `Below` / `ToTheLeft` / `ToTheRight`. An on-screen arrow pad covers touch devices, which
  have no arrow keys.

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
preview use the same base.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages.
Repository settings need **Pages → Build and deployment → Source** set to **GitHub Actions**.

## License

MIT &mdash; see [LICENSE](./LICENSE).
