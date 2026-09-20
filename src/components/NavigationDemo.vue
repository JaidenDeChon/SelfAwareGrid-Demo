<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import ResizablePanel from './ResizablePanel.vue';
import CodeBlock from './CodeBlock.vue';
import StatChip from './StatChip.vue';
import { useSelfAwareGrid } from '../composables/useSelfAwareGrid';
import { initialCellCount } from '../cellCount';

type Direction = 'up' | 'down' | 'left' | 'right';

const gridElement = useTemplateRef<HTMLElement>('gridElement');
const { grid, columnCount, rowCount, refresh } = useSelfAwareGrid(gridElement);

const cellCount = ref(initialCellCount(24));
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

/** The original demo's shortcut into the grid: put focus on cell zero and let the arrow keys take over. */
function focusFirstChild (): void {
    activeIndex.value = 0;
    void nextTick(() => (gridElement.value?.children[0] as HTMLElement | undefined)?.focus());
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

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">01 &mdash; Navigation</p>
        <h2 class="mt-3 font-display text-3xl font-extralight tracking-tight sm:text-4xl">Navigate a grid like a spreadsheet</h2>
        <!-- The package author's own description of the problem, kept word for word. -->
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            There is no easy way to navigate a grid of focusable items the same way you would a spreadsheet. If you
            want to traverse through a grid using anything other than your &ldquo;Tab&rdquo; key, such as arrow-keys
            or anything else, or if you want to traverse vertically and not just horizontally, you&rsquo;re in for a
            hard time setting that behavior up on your own. SelfAwareGrid helps with this process, providing an easy
            way to make this behavior possible on a responsive grid.
        </p>

        <div class="mt-8 flex flex-wrap gap-2 sm:gap-3">
            <StatChip label="Column count" :value="columnCount" />
            <StatChip label="Row count" :value="rowCount" />
            <StatChip label="Focused child" :value="activeIndex" />
        </div>

        <h3 class="mt-8 font-display text-lg font-extralight tracking-tight">
            Focus a grid item, then traverse using arrow-keys!
        </h3>

        <div class="mt-3">
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
            <div class="flex flex-col items-start gap-3">
                <button type="button" class="control-button" @click="focusFirstChild">Focus First Child</button>
                <p class="max-w-md text-sm leading-relaxed text-ink-muted">
                    Then use the
                    <kbd class="kbd">&uarr;</kbd> <kbd class="kbd">&darr;</kbd>
                    <kbd class="kbd">&larr;</kbd> <kbd class="kbd">&rarr;</kbd>
                    keys &mdash; or the pad, which is there because phones do not have arrow keys.
                </p>
            </div>

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

        <div class="mt-6 flex flex-wrap items-center gap-3">
            <button
                type="button"
                class="control-button"
                :disabled="cellCount >= 72"
                @click="cellCount = Math.min(72, cellCount + 1)"
            >Add one</button>
            <button
                type="button"
                class="control-button"
                :disabled="cellCount <= 4"
                @click="cellCount = Math.max(4, cellCount - 1)"
            >Remove one</button>
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

@media (prefers-reduced-motion: reduce) {
    .cell,
    .pad-button {
        transition: none;
    }
}
</style>
