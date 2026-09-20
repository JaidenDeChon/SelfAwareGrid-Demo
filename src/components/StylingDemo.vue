<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import ResizablePanel from './ResizablePanel.vue';
import CodeBlock from './CodeBlock.vue';
import StatChip from './StatChip.vue';
import { useSelfAwareGrid } from '../composables/useSelfAwareGrid';
import { initialCellCount } from '../cellCount';

const gridElement = useTemplateRef<HTMLElement>('gridElement');
const { grid, columnCount, rowCount, refresh } = useSelfAwareGrid(gridElement);

const cellCount = ref(initialCellCount(32));
const selectedIndex = ref<number | null>(null);

// Adding or removing children changes the grid, so the library needs to re-collect them. `flush: 'post'` waits
// for Vue to have patched the DOM first.
watch(cellCount, () => {
    if (selectedIndex.value !== null && selectedIndex.value >= cellCount.value) selectedIndex.value = null;
    refresh();
}, { flush: 'post' });

const selection = computed(() => {
    // Touching these keeps the readout live as the panel is resized or cells are added.
    void columnCount.value;
    void rowCount.value;
    void cellCount.value;

    const instance = grid.value;
    const index = selectedIndex.value;
    if (!instance || index === null) return null;

    return {
        index,
        row: instance.isNthRow(index),
        column: instance.isNthColumn(index),
        isTopRow: instance.isTopRow(index),
        isBottomRow: instance.isBottomRow(index),
        isLeftColumn: instance.isLeftColumn(index),
        isRightColumn: instance.isRightColumn(index)
    };
});

const booleans = computed(() => {
    const current = selection.value;
    if (!current) return [];
    return [
        { name: 'isTopRow', value: current.isTopRow },
        { name: 'isBottomRow', value: current.isBottomRow },
        { name: 'isLeftColumn', value: current.isLeftColumn },
        { name: 'isRightColumn', value: current.isRightColumn }
    ];
});

const snippet = `import SelfAwareGrid from 'self-aware-grid';

const grid = new SelfAwareGrid(document.querySelector('#gallery'));
grid.beginObservingResize();`;

const cssSnippet = `/* Every child is tagged with where it currently sits. */
.self-aware-grid__child--is-top-row    { background: #007BFF; }
.self-aware-grid__child--is-left-column { background: #007BFF; }
.self-aware-grid__child--is-bottom-row { background: #FFD700; }
.self-aware-grid__child--is-right-column { background: #FFD700; }`;
</script>

<template>
    <section id="styling" class="shell scroll-mt-20 py-14 sm:py-20">

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">03 &mdash; Classnames</p>
        <h2 class="mt-3 font-display text-3xl font-extralight tracking-tight sm:text-4xl">Style rows and columns easily</h2>
        <!-- The package author's own description of the problem, kept word for word. -->
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Using CSS, there&rsquo;s no way to style specific columns or rows of a responsive grid. If you know
            exactly which column or row you&rsquo;d like to target, then you can do so, but if your grid is a
            responsive one, you&rsquo;re out of luck. SelfAwareGrid helps by allowing you to target and style any
            specific row or column in a grid with dynamically-placed children.
        </p>

        <div class="mt-8 flex flex-wrap gap-2 sm:gap-3">
            <StatChip label="Column count" :value="columnCount" />
            <StatChip label="Row count" :value="rowCount" />
            <StatChip label="Cell count" :value="cellCount" />
        </div>

        <h3 class="mt-8 font-display text-lg font-extralight tracking-tight">Resize me!</h3>

        <div class="mt-3">
            <ResizablePanel label="Resize the styling demo grid" :initial-fraction="0.72">
                <div ref="gridElement" class="sag-grid">
                    <button
                        v-for="index in cellCount"
                        :key="index"
                        type="button"
                        class="cell"
                        :class="selectedIndex === index - 1 ? 'is-selected' : ''"
                        :aria-pressed="selectedIndex === index - 1"
                        :aria-label="`Inspect cell ${index - 1}`"
                        @click="selectedIndex = selectedIndex === index - 1 ? null : index - 1"
                    >{{ index - 1 }}</button>
                </div>
            </ResizablePanel>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-3">
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

            <p class="basis-full font-mono text-xs text-ink-muted sm:basis-auto">Tap a cell to inspect it</p>
        </div>

        <!-- Inspector -->
        <div class="mt-4 rounded-2xl border border-line bg-panel p-4 sm:p-5">
            <p v-if="!selection" class="font-mono text-sm text-ink-muted">
                No cell selected. Tap one above to read its position straight off the API.
            </p>

            <div v-else class="flex flex-col gap-4">
                <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span class="font-mono text-sm text-ink-muted">cell</span>
                    <span class="font-mono text-2xl font-semibold text-brand-500">{{ selection.index }}</span>
                    <span class="font-mono text-sm text-ink-muted">
                        isNthRow &rarr; <span class="text-ink">{{ selection.row }}</span>
                        &nbsp;&middot;&nbsp;
                        isNthColumn &rarr; <span class="text-ink">{{ selection.column }}</span>
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div
                        v-for="item in booleans"
                        :key="item.name"
                        class="rounded-lg border px-3 py-2 font-mono text-xs transition-colors duration-150"
                        :class="item.value
                            ? 'border-brand-500/60 bg-brand-500/10 text-ink'
                            : 'border-line bg-raised text-ink-muted'"
                    >
                        <span class="block truncate">{{ item.name }}</span>
                        <span class="font-semibold" :class="item.value ? 'text-brand-500' : ''">{{ item.value }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
            <CodeBlock label="setup.js" :code="snippet" />
            <CodeBlock label="styles.css" :code="cssSnippet" lang="css" />
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
    transition: transform 150ms ease, box-shadow 150ms ease;
}

.cell:hover {
    transform: translateY(-1px);
}

.cell.is-selected {
    box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--color-brand-500);
}

/*
 * Everything below is driven purely by the classnames SelfAwareGrid assigns. Nothing here knows how many
 * columns the grid has — the same rules hold at every width.
 */
.cell.self-aware-grid__child--is-top-row,
.cell.self-aware-grid__child--is-left-column {
    border-color: transparent;
    background: var(--color-brand-500);
    color: #ffffff;
}

.cell.self-aware-grid__child--is-bottom-row,
.cell.self-aware-grid__child--is-right-column {
    border-color: transparent;
    background: var(--color-accent-500);
    color: hsl(222 47% 11%);
}

.cell.self-aware-grid__child--is-top-row.self-aware-grid__child--is-left-column {
    background: var(--color-brand-500);
    color: #ffffff;
}

.cell.self-aware-grid__child--is-top-row.self-aware-grid__child--is-right-column {
    background: linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500));
    color: #ffffff;
}

.cell.self-aware-grid__child--is-bottom-row.self-aware-grid__child--is-left-column {
    background: linear-gradient(45deg, var(--color-brand-500), var(--color-accent-500));
    color: #ffffff;
}

.cell.self-aware-grid__child--is-bottom-row.self-aware-grid__child--is-right-column {
    background: var(--color-accent-500);
    color: hsl(222 47% 11%);
}

@media (prefers-reduced-motion: reduce) {
    .cell {
        transition: none;
    }

    .cell:hover {
        transform: none;
    }
}
</style>
