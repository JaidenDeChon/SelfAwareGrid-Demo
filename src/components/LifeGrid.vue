<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue';
import SelfAwareGrid from 'self-aware-grid';

const CELL = 56;
const STEP_MS = 700;
const SEED_DENSITY = 0.3;

const container = useTemplateRef<HTMLElement>('container');
const gridElement = useTemplateRef<HTMLElement>('gridElement');

const cellCount = ref(0);

const grid = shallowRef<SelfAwareGrid | null>(null);

/** For each cell, the indices of its eight neighbours. Rebuilt whenever the grid reflows. */
let neighbours: number[][] = [];
let cells: Uint8Array = new Uint8Array(0);
let previous: Uint8Array = new Uint8Array(0);

let timer: ReturnType<typeof setInterval> | undefined;
let resizeObserver: ResizeObserver | null = null;
let visibilityObserver: IntersectionObserver | null = null;
let onVisibilityChange: (() => void) | null = null;

let onScreen = true;
let generation = 0;
let reducedMotion = false;

/**
 * Builds the neighbour table using SelfAwareGrid itself.
 *
 * The library answers "what is above / below / left / right of this cell, given how the grid is currently
 * laid out", and knows which cells sit on an edge. The four diagonals come from composing two of those
 * steps. That is the whole topology Life needs, and none of it hard-codes a column count — when the hero
 * reflows, the same calls give different answers and the table is simply rebuilt.
 */
function buildNeighbours (): void {
    const instance = grid.value;
    if (!instance) return;

    const total = cells.length;

    const up = (i: number) => (instance.isTopRow(i) ? -1 : instance.getGridItemAbove(i));
    const down = (i: number) => (instance.isBottomRow(i) ? -1 : instance.getGridItemBelow(i));
    const left = (i: number) => (instance.isLeftColumn(i) ? -1 : instance.getGridItemToTheLeft(i, true));
    const right = (i: number) => (instance.isRightColumn(i) ? -1 : instance.getGridItemToTheRight(i));

    const inRange = (i: number) => i >= 0 && i < total;
    const step = (from: number, move: (i: number) => number) => (inRange(from) ? move(from) : -1);

    neighbours = new Array(total);

    for (let i = 0; i < total; i++) {
        const u = up(i);
        const d = down(i);

        const candidates = [
            u,
            d,
            left(i),
            right(i),
            step(u, left),
            step(u, right),
            step(d, left),
            step(d, right)
        ];

        neighbours[i] = candidates.filter(inRange);
    }
}

function seed (): void {
    for (let i = 0; i < cells.length; i++) {
        cells[i] = Math.random() < SEED_DENSITY ? 1 : 0;
    }
    generation = 0;
}

/** Sprinkles life back in when the soup has settled or nearly died out, so the hero never goes static. */
function isStagnant (): boolean {
    let population = 0;
    let identical = true;

    for (let i = 0; i < cells.length; i++) {
        population += cells[i];
        if (identical && cells[i] !== previous[i]) identical = false;
    }

    return identical || population < cells.length * 0.04;
}

function paint (): void {
    const children = gridElement.value?.children;
    if (!children) return;

    for (let i = 0; i < cells.length; i++) {
        (children[i] as HTMLElement | undefined)?.classList.toggle('is-alive', cells[i] === 1);
    }
}

function tick (): void {
    if (!onScreen || document.hidden) return;

    previous.set(cells);

    for (let i = 0; i < cells.length; i++) {
        let alive = 0;
        const around = neighbours[i];

        for (let n = 0; n < around.length; n++) alive += previous[around[n]];

        // B3/S23: a cell is born on exactly three live neighbours and survives on two or three.
        cells[i] = previous[i] === 1 ? (alive === 2 || alive === 3 ? 1 : 0) : (alive === 3 ? 1 : 0);
    }

    generation++;
    if (isStagnant() || generation > 240) seed();

    paint();
}

/**
 * Fills the hero with exactly as many cells as it takes to cover it, in whole rows.
 *
 * The column count comes from SelfAwareGrid once the cells exist; this only works out how many DOM nodes to
 * create in the first place, which the library cannot know before they are there.
 */
function resize (): void {
    if (!container.value) return;

    const { width, height } = container.value.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const columns = Math.max(1, Math.floor(width / CELL));
    const rows = Math.max(1, Math.ceil(height / CELL));
    const total = columns * rows;

    if (total === cells.length) return;

    cellCount.value = total;
    cells = new Uint8Array(total);
    previous = new Uint8Array(total);
    seed();

    // Let Vue render the new cells before the library measures them.
    requestAnimationFrame(() => {
        if (!gridElement.value) return;

        grid.value?.destroy();
        grid.value = new SelfAwareGrid(gridElement.value, CELL, false);
        grid.value.beginObservingResize();

        buildNeighbours();
        paint();
    });
}

onMounted(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resize();

    resizeObserver = new ResizeObserver(() => resize());
    if (container.value) resizeObserver.observe(container.value);

    // A background animation should not run while it is scrolled away or the tab is hidden.
    visibilityObserver = new IntersectionObserver((entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
    });
    if (container.value) visibilityObserver.observe(container.value);

    onVisibilityChange = () => { if (!document.hidden) paint(); };
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (!reducedMotion) timer = setInterval(tick, STEP_MS);
});

onBeforeUnmount(() => {
    clearInterval(timer);
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange);
    grid.value?.destroy();
    grid.value = null;
});
</script>

<template>
    <div ref="container" class="life" aria-hidden="true">
        <div ref="gridElement" class="life-grid">
            <div v-for="index in cellCount" :key="index" class="life-cell"></div>
        </div>
    </div>
</template>

<style scoped>
.life {
    position: absolute;
    inset: 0;
    overflow: hidden;

    /* The same fade the static grid had: everything dissolves away from the top centre. */
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%);
    mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%);
}

.life-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 56px);
    column-gap: 0;
    row-gap: 0;
}

.life-cell {
    width: 56px;
    height: 56px;
    box-sizing: border-box;

    /* Only two of the four edges, so adjacent cells do not double up their rules. */
    border-top: 1px solid var(--line);
    border-left: 1px solid var(--line);

    background-color: transparent;
    opacity: 0.4;

    transition: background-color 600ms ease-out, opacity 600ms ease-out;
}

.life-cell.is-alive {
    background-color: color-mix(in srgb, var(--color-brand-500) 18%, transparent);
    opacity: 1;
}

:global(.dark) .life-cell.is-alive {
    background-color: color-mix(in srgb, var(--color-brand-500) 26%, transparent);
}

@media (prefers-reduced-motion: reduce) {
    .life-cell {
        transition: none;
    }
}
</style>
