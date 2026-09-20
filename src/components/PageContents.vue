<script setup lang="ts">
import { ref } from 'vue';
import { docsHeadings } from '../docs';
import { useScrollSpy } from '../composables/useScrollSpy';

interface ContentsEntry {
    id: string;
    text: string;
    depth: 2 | 3 | 4;
}

/**
 * Everything on the page below the hero, in document order.
 *
 * The docs section used to carry a contents list of its own; this is that same list, grown to cover the whole
 * page, which is why the README's headings sit one level deeper here than they did when they were the only
 * thing in it.
 */
const entries: ContentsEntry[] = [
    { id: 'examples', text: 'Examples', depth: 2 },
    { id: 'navigation', text: 'Navigation', depth: 3 },
    { id: 'life', text: 'Game of Life', depth: 3 },
    // "Styling", not the demo's own "Classnames" eyebrow: the README below has a Classnames heading of
    // its own, and two identical entries in one list tell the reader nothing.
    { id: 'styling', text: 'Styling', depth: 3 },
    { id: 'docs', text: 'Documentation', depth: 2 },
    ...docsHeadings.map((heading) => ({
        id: heading.id,
        text: heading.text,
        depth: (heading.depth + 1) as 3 | 4
    }))
];

// The first entry stays selected while the reader is still above it, so the list is never blank.
const { active } = useScrollSpy(entries.map((entry) => entry.id), { fallbackToFirst: true });

const indent: Record<number, string> = {
    2: 'pl-3 font-medium',
    3: 'pl-6',
    4: 'pl-9'
};

/**
 * Below the sidebar breakpoint the list would be a dozen links between the hero and the first example, so
 * there it collapses behind its own heading instead. The sticky rail is always open.
 */
const open = ref(false);
</script>

<template>
    <nav class="border-b border-line py-4 lg:border-b-0 lg:py-20" aria-label="Page contents">
        <div class="lg:sticky lg:top-24">

            <button
                type="button"
                class="flex w-full items-center justify-between gap-3 font-mono text-xs uppercase tracking-wider text-ink-muted lg:hidden"
                :aria-expanded="open"
                @click="open = !open"
            >
                Contents
                <svg
                    class="h-4 w-4 transition-transform duration-150"
                    :class="open ? 'rotate-180' : ''"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            <p class="hidden font-mono text-xs uppercase tracking-wider text-ink-muted lg:block">Contents</p>

            <ul class="mt-3 space-y-1.5 border-l border-line lg:block" :class="open ? '' : 'hidden'">
                <li v-for="entry in entries" :key="entry.id">
                    <!--
                        The active entry gets the full treatment. Hovering a different entry previews it in a
                        dimmer form; hovering the active one changes nothing, because its classes replace the
                        hover ones rather than sitting underneath them.
                    -->
                    <a
                        class="-ml-px block border-l py-0.5 text-sm transition-colors duration-150"
                        :class="[
                            indent[entry.depth],
                            active === entry.id
                                ? 'border-brand-500 text-ink'
                                : 'border-transparent text-ink-muted hover:border-brand-500/40 hover:text-ink/70'
                        ]"
                        :aria-current="active === entry.id ? 'location' : undefined"
                        :href="`#${entry.id}`"
                        @click="open = false"
                    >{{ entry.text }}</a>
                </li>
            </ul>
        </div>
    </nav>
</template>
