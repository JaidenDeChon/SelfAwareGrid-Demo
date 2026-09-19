import { marked } from 'marked';
import readme from 'self-aware-grid/README.md?raw';

export interface DocsHeading {
    id: string;
    text: string;
    depth: 2 | 3;
}

export type DocsPart =
    | { kind: 'html'; html: string }
    | { kind: 'code'; label: string; code: string; lang: string };

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
        .replace(/\n##\s+Demo\s*\n[\s\S]*$/, '\n')
        // TEMPORARY. The section was renamed on the package's main branch, but this page reads the README
        // out of the published tarball, which still carries the old heading. Delete this line once a
        // release containing the rename has shipped and the dependency has been bumped to it.
        .replace(/^###\s+Contextual Awareness\s*$/m, '### Relative Position');
}

function slugify (text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Nearly every snippet in the README opens with a line comment describing what the call does. That reads
 * better as the snippet's header — and moving it there means the copy button comes along with it, rather
 * than each block needing its own.
 */
function splitLeadingComment (source: string): { label: string; code: string } {
    const lines = source.split('\n');
    const comment: string[] = [];

    while (lines.length && lines[0].trim().startsWith('//')) {
        comment.push(lines.shift()!.trim().replace(/^\/\/\s?/, ''));
    }

    while (lines.length && lines[0].trim() === '') lines.shift();

    return { label: comment.join(' '), code: lines.join('\n').trimEnd() };
}

const rendered = marked.parse(forThisPage(readme), { async: false }) as string;

const parsed = new DOMParser().parseFromString(rendered, 'text/html');
const headings: DocsHeading[] = [];

parsed.body.querySelectorAll('h2, h3').forEach((element) => {
    const text = element.textContent ?? '';
    const id = slugify(text);
    element.id = id;
    headings.push({ id, text, depth: element.tagName === 'H3' ? 3 : 2 });
});

// Split the document into prose and code, so the code can be rendered by the same component (and so get the
// same header, copy button and highlighting) as the snippets written by hand elsewhere on the page.
const parts: DocsPart[] = [];
let prose: string[] = [];

function flushProse (): void {
    const html = prose.join('');
    if (html.trim()) parts.push({ kind: 'html', html });
    prose = [];
}

parsed.body.childNodes.forEach((node) => {
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : null;
    const code = element?.tagName === 'PRE' ? element.querySelector('code') : null;

    if (!code) {
        prose.push(element ? element.outerHTML : (node.textContent ?? ''));
        return;
    }

    flushProse();

    const lang = /language-(\w+)/.exec(code.className)?.[1] ?? 'javascript';
    const { label, code: body } = splitLeadingComment(code.textContent ?? '');

    parts.push({ kind: 'code', label: label || lang, code: body, lang });
});

flushProse();

export const docsParts = parts;
export const docsHeadings = headings;
