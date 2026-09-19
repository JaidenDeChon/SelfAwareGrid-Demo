/*
 * Renders tools/social-preview.html to public/social-preview.png at 1200x630.
 *
 *   node tools/social-preview.mjs
 *
 * Needs Playwright available (a global install is fine — it is deliberately not a dependency of this
 * project, so `npm ci` in CI does not pull a browser down for a file that changes once in a blue moon).
 *
 * The web fonts are downloaded and inlined as data URIs before rendering rather than being loaded from
 * Google Fonts at render time. Screenshotting a page whose fonts have not arrived silently produces a
 * fallback-serif image that looks almost right, and inlining removes that failure mode entirely.
 */
import { createRequire } from 'node:module';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'social-preview.html');
const output = join(here, '..', 'public', 'social-preview.png');

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000' +
    '&family=Idiqlat:wght@200;400&family=JetBrains+Mono:wght@400;600&display=swap';

// Google Fonts serves woff2 only to browsers that ask like one.
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/120.0.0.0 Safari/537.36';

function loadPlaywright () {
    const require = createRequire(import.meta.url);

    for (const specifier of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
        try {
            return require(specifier);
        } catch {
            // Try the next location.
        }
    }

    throw new Error('Playwright not found. Install it (npm i -g playwright) and re-run.');
}

/** Replaces the Google Fonts stylesheet link with @font-face rules carrying the fonts inline. */
async function inlineFonts (html) {
    const css = await (await fetch(FONT_CSS, { headers: { 'User-Agent': BROWSER_UA } })).text();

    const faces = [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map((match) => match[0]);
    const latin = faces.filter((face) => face.includes('U+0000-00FF'));

    const inlined = await Promise.all(latin.map(async (face) => {
        const url = /url\((https:\/\/[^)]+)\)/.exec(face)?.[1];
        if (!url) return face;

        const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
        return face.replace(url, `data:font/woff2;base64,${bytes.toString('base64')}`);
    }));

    console.log(`inlined ${inlined.length} font faces`);

    return html
        .replace(/<link rel="preconnect"[\s\S]*?rel="stylesheet"\s*\/>/, `<style>${inlined.join('\n')}</style>`);
}

const { chromium } = loadPlaywright();

const html = await inlineFonts(await readFile(source, 'utf8'));
const scratch = await mkdtemp(join(tmpdir(), 'social-preview-'));
const page = join(scratch, 'preview.html');
await writeFile(page, html);

const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: 'dark'
});

const tab = await context.newPage();
await tab.goto(pathToFileURL(page).href, { waitUntil: 'load' });
await tab.waitForFunction(() => document.documentElement.dataset.ready === 'true');

// Fail loudly rather than quietly shipping a fallback-serif image.
const missing = await tab.evaluate(async () => {
    await document.fonts.ready;
    return ['400 112px Idiqlat', '400 31px "Afacad Flux"', '400 21px "JetBrains Mono"']
        .filter((font) => !document.fonts.check(font));
});

if (missing.length) throw new Error(`fonts did not load: ${missing.join(', ')}`);

await tab.screenshot({ path: output });
await browser.close();

console.log(`wrote ${output}`);
