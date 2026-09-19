import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';

// Only the two languages this site actually shows, so the bundle does not carry the other ~190.
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);

function escapeHtml (value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Returns highlighted markup for a snippet, or escaped plain text when the language is unknown.
 * The colours live in `style.css` — this only emits highlight.js's classnames.
 */
export function highlight (code: string, language?: string): string {
    if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    }

    return escapeHtml(code);
}
