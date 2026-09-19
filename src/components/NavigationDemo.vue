<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import ResizablePanel from './ResizablePanel.vue';
import CodeBlock from './CodeBlock.vue';
import StatChip from './StatChip.vue';
import { useSelfAwareGrid } from '../composables/useSelfAwareGrid';

type Direction = 'up' | 'down' | 'left' | 'right';

const gridElement = useTemplateRef<HTMLElement>('gridElement');
const { grid, columnCount, rowCount, refresh } = useSelfAwareGrid(gridElement);

const cellCount = ref(24);
const activeIndex = ref(0);

watch(cellCount, () => {
    if (activeIndex.value >= cellCount.value) activeIndex.value = cellCount.value - 1;
    refresh();
}, { flush: 'post' });

function resolve (direction: Direction, from: number): number | undefined {
    const instance = grid.value;
    if (!instance) return undefined;

    switch (direction) {
        case 'up': return instance.getGridItemAbove(from);
        case 'down': return instance.getGridItemBelow(from);
        case 'left': return instance.getGridItemToTheLeft(from);
        case 'right': return instance.getGridItemToTheRight(from);
    }
}

/**
 * Moves the selection. `focusCell` is false for the on-screen arrow pad so that repeated taps do not have to
 * chase focus back to the pad on a touch screen.
 */
function move (direction: Direction, focusCell: boolean): void {
    const next = resolve(direction, activeIndex.value);
    if (next === undefined) return;

    // The library returns raw arithmetic for partially-filled rows, so keep it inside the grid.
    activeIndex.value = Math.min(Math.max(next, 0), cellCount.value - 1);

    void nextTick(() => {
        const cell = gridElement.value?.children[activeIndex.value] as HTMLElement | undefined;
        if (!cell) return;
        if (focusCell) cell.focus();
        else cell.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
}

function onKeydown (event: KeyboardEvent): void {
    const directions: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
    };

    const direction = directions[event.key];
    if (!direction) return;

    event.preventDefault();
    move(direction, true);
}

const snippet = `const grid = new SelfAwareGrid(gridElement);

gridElement.addEventListener('keydown', (event) => {
    const from = activeIndex;

    if (event.key === 'ArrowUp')    next = grid.getGridItemAbove(from);
    if (event.key === 'ArrowDown')  next = grid.getGridItemBelow(from);
    if (event.key === 'ArrowLeft')  next = grid.getGridItemToTheLeft(from);
    if (event.key === 'ArrowRight') next = grid.getGridItemToTheRight(from);

    gridElement.children[next].focus();
});`;

const pad: { direction: Direction; label: string; glyph: string; area: string }[] = [
    { direction: 'up', label: 'Move up', glyph: '↑', area: 'up' },
    { direction: 'left', label: 'Move left', glyph: '←', area: 'left' },
    { direction: 'right', label: 'Move right', glyph: '→', area: 'right' },
    { direction: 'down', label: 'Move down', glyph: '↓', area: 'down' }
];
</script>

<template>
    <section id="navigation" class="shell scroll-mt-20 py-14 sm:py-20">

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">02 &mdash; Navigation</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Move through a grid like a spreadsheet</h2>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            <kbd class="kbd">Tab</kbd> only ever walks a grid in document order. Because SelfAwareGrid knows how many
            columns are currently rendered, it can hand you the index of the cell above, below, left or right &mdash;
            and that answer stays correct as the grid reflows.
        </p>

        <div class="mt-8 flex flex-wrap gap-2 sm:gap-3">
            <StatChip label="columns" :value="columnCount" />
            <StatChip label="rows" :value="rowCount" />
            <StatChip label="active" :value="activeIndex" />
        </div>

        <div class="mt-6">
            <ResizablePanel label="Resize the navigation demo grid" :initial-fraction="0.72">
                <div ref="gridElement" class="sag-grid" @keydown="onKeydown">
                    <button
                        v-for="index in cellCount"
                        :key="index"
                        type="button"
                        class="cell"
                        :class="activeIndex === index - 1 ? 'is-active' : ''"
                        :tabindex="activeIndex === index - 1 ? 0 : -1"
                        :aria-label="`Cell ${index - 1}`"
                        @click="activeIndex = index - 1"
                    >{{ index - 1 }}</button>
                </div>
            </ResizablePanel>
        </div>

        <div class="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p class="max-w-md text-sm leading-relaxed text-ink-muted">
                Focus a cell and use the
                <kbd class="kbd">&uarr;</kbd> <kbd class="kbd">&darr;</kbd>
                <kbd class="kbd">&larr;</kbd> <kbd class="kbd">&rarr;</kbd>
                keys &mdash; or use the pad, which is there because phones do not have arrow keys.
            </p>

            <div class="arrow-pad" role="group" aria-label="Move the selection">
                <button
                    v-for="button in pad"
                    :key="button.direction"
                    type="button"
                    class="pad-button"
                    :style="{ gridArea: button.area }"
                    :aria-label="button.label"
                    @click="move(button.direction, false)"
                >{{ button.glyph }}</button>
            </div>
        </div>

        <div class="mt-6 flex w-fit items-center gap-1 rounded-xl border border-line bg-panel p-1">
            <button
                type="button"
                class="stepper"
                aria-label="Remove a cell"
                :disabled="cellCount <= 4"
                @click="cellCount = Math.max(4, cellCount - 4)"
            >&minus;</button>
            <span class="min-w-20 text-center font-mono text-xs text-ink-muted">{{ cellCount }} cells</span>
            <button
                type="button"
                class="stepper"
                aria-label="Add a cell"
                :disabled="cellCount >= 72"
                @click="cellCount = Math.min(72, cellCount + 4)"
            >+</button>
        </div>

        <div class="mt-6">
            <CodeBlock label="navigation.js" :code="snippet" />
        </div>
    </section>
</template>

<style scoped>
.sag-grid {
    --cell: 56px;

    display: grid;
    grid-template-columns: repeat(auto-fill, var(--cell));
    column-gap: 12px;
    row-gap: 12px;
}

.cell {
    width: var(--cell);
    height: var(--cell);

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--line);
    border-radius: 10px;
    background-color: var(--raised);

    color: var(--ink-muted);
    font-family: var(--font-mono);
    font-size: 0.7rem;

    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease;
}

.cell.is-active {
    border-color: transparent;
    background: var(--color-brand-500);
    color: #ffffff;
    box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--color-brand-500);
}

.arrow-pad {
    display: grid;
    grid-template-areas:
        '.    up    .'
        'left down  right';
    gap: 0.4rem;
    justify-content: start;
}

.pad-button {
    width: 3rem;
    height: 3rem;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--line);
    border-radius: 0.75rem;
    background-color: var(--panel);

    color: var(--ink);
    font-size: 1.1rem;

    /* Keep a tap on the pad from being read as a scroll gesture. */
    touch-action: manipulation;
    transition: background-color 150ms ease, border-color 150ms ease;
}

.pad-button:hover {
    border-color: var(--color-brand-500);
    background-color: color-mix(in srgb, var(--color-brand-500) 10%, transparent);
}

.pad-button:active {
    background-color: color-mix(in srgb, var(--color-brand-500) 22%, transparent);
}

.kbd {
    display: inline-block;
    padding: 0.05rem 0.4rem;

    border: 1px solid var(--line);
    border-radius: 0.375rem;
    background-color: var(--raised);

    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.75rem;
}

.stepper {
    width: 2.25rem;
    height: 2.25rem;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    border-radius: 0.5rem;
    color: var(--ink);
    font-size: 1.125rem;
    line-height: 1;

    transition: background-color 150ms ease, color 150ms ease;
}

.stepper:hover:not(:disabled) {
    background-color: var(--raised);
    color: var(--color-brand-500);
}

.stepper:disabled {
    color: var(--ink-muted);
    opacity: 0.4;
    cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
    .cell,
    .pad-button,
    .stepper {
        transition: none;
    }
}
</style>
