<script setup lang="ts">
import CodeBlock from './CodeBlock.vue';

const install = `npm install self-aware-grid`;

const usage = `import SelfAwareGrid from 'self-aware-grid';

const element = document.querySelector('#my-grid');
const grid = new SelfAwareGrid(element);

// Keep the measurements in step with the grid as it reflows.
grid.beginObservingResize();

grid.columnCount();        // how many columns are rendered right now
grid.isRightColumn(7);     // is cell 7 currently in the last column?
grid.getGridItemBelow(7);  // index of the cell directly underneath

// Tear down when the grid goes away.
grid.destroy();`;

const api = [
    {
        group: 'Where am I?',
        methods: [
            ['isTopRow(i)', 'Is this cell in the top row?'],
            ['isBottomRow(i)', 'Is this cell in the bottom row?'],
            ['isLeftColumn(i)', 'Is this cell in the first column?'],
            ['isRightColumn(i)', 'Is this cell in the last column?'],
            ['isNthRow(i)', 'Which row the cell is in, zero-based.'],
            ['isNthColumn(i)', 'Which column the cell is in, zero-based.']
        ]
    },
    {
        group: 'What is next to me?',
        methods: [
            ['getGridItemAbove(i)', 'Index of the cell directly above.'],
            ['getGridItemBelow(i)', 'Index of the cell directly below.'],
            ['getGridItemToTheLeft(i)', 'Index of the previous cell.'],
            ['getGridItemToTheRight(i)', 'Index of the next cell.']
        ]
    },
    {
        group: 'The grid itself',
        methods: [
            ['columnCount()', 'Columns currently rendered.'],
            ['rowCount()', 'Rows currently rendered.'],
            ['columnGapWidth()', 'The measured column gap, in pixels.'],
            ['setupChildren()', 'Re-collect children after they change.'],
            ['beginObservingResize()', 'Recalculate whenever the grid resizes.'],
            ['destroy()', 'Detach the observer and listeners.']
        ]
    }
];

const classnames = [
    ['self-aware-grid', 'Added to the grid container itself.'],
    ['self-aware-grid__child', 'Added to every child.'],
    ['self-aware-grid__child--0', 'Each child also gets its index.'],
    ['self-aware-grid__child--is-top-row', 'Currently in the top row.'],
    ['self-aware-grid__child--is-bottom-row', 'Currently in the bottom row.'],
    ['self-aware-grid__child--is-left-column', 'Currently in the first column.'],
    ['self-aware-grid__child--is-right-column', 'Currently in the last column.']
];
</script>

<template>
    <section id="install" class="shell scroll-mt-20 border-t border-line py-14 sm:py-20">

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">03 &mdash; Using it</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Two lines to get started</h2>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Hand SelfAwareGrid an element with <code class="inline-code">display: grid</code> and uniformly sized
            children. It measures the container, the children and the gaps, then keeps everything in step.
        </p>

        <div class="mt-8 grid min-w-0 gap-4 lg:grid-cols-2">
            <CodeBlock label="terminal" :code="install" />
            <div class="min-w-0 lg:row-span-2">
                <CodeBlock label="usage.js" :code="usage" />
            </div>
        </div>

        <h3 class="mt-14 text-xl font-semibold tracking-tight">Classnames it assigns</h3>
        <ul class="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
            <li
                v-for="[name, detail] in classnames"
                :key="name"
                class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6"
            >
                <code class="break-words font-mono text-sm text-brand-500 sm:w-80 sm:shrink-0">{{ name }}</code>
                <span class="text-sm text-ink-muted">{{ detail }}</span>
            </li>
        </ul>

        <h3 class="mt-14 text-xl font-semibold tracking-tight">API</h3>
        <div class="mt-4 grid min-w-0 gap-4 md:grid-cols-3">
            <div v-for="section in api" :key="section.group" class="min-w-0 rounded-xl border border-line bg-panel p-4">
                <p class="font-mono text-xs uppercase tracking-wider text-ink-muted">{{ section.group }}</p>
                <ul class="mt-3 space-y-3">
                    <li v-for="[name, detail] in section.methods" :key="name">
                        <code class="block break-words font-mono text-sm text-brand-500">{{ name }}</code>
                        <span class="text-sm leading-snug text-ink-muted">{{ detail }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<style scoped>
.inline-code {
    padding: 0.05rem 0.35rem;

    border-radius: 0.3rem;
    background-color: var(--raised);

    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.85em;
}
</style>
