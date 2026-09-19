import { marked } from 'marked';
import readme from 'self-aware-grid/README.md?raw';

export interface DocsHeading {
    id: string;
    text: string;
    depth: 2 | 3;
}

/**
 * The docs on this page are the package's own README, read straight out of the installed copy of
 * `self-aware-grid` — bumping the dependency updates the docs with it, so the two can never drift.
 *
 * Only the parts that would read oddly on this page are dropped, and the rest is verbatim:
 *   - the `# SelfAwareGrid` title and the intro, which the hero at the top of this page already quotes in full;
 *   - the two "see the demo" links, which point back at the page you are already reading.
 */
function forThisPage (markdown: string): string {
    const fromUsage = markdown.indexOf('\n## Usage');

    return (fromUsage === -1 ? markdown : markdown.slice(fromUsage + 1))
        .replace(/\n##\s+Demo\s*\n[\s\S]*$/, '\n');
}

function slugify (text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const rendered = marked.parse(forThisPage(readme), { async: false }) as string;

// Give every heading an id so the contents list can link to it, and collect those headings as it goes.
const parsed = new DOMParser().parseFromString(rendered, 'text/html');
const headings: DocsHeading[] = [];

parsed.body.querySelectorAll('h2, h3').forEach((element) => {
    const text = element.textContent ?? '';
    const id = slugify(text);
    element.id = id;
    headings.push({ id, text, depth: element.tagName === 'H3' ? 3 : 2 });
});

export const docsHtml = parsed.body.innerHTML;
export const docsHeadings = headings;
