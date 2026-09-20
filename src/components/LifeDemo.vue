<script setup lang="ts">
import { useTemplateRef } from 'vue';
import LifeBoard from './LifeBoard.vue';
import CodeBlock from './CodeBlock.vue';
import StatChip from './StatChip.vue';

/*
 * The hero backdrop runs the same simulation at 56px. Here the cells are a third of that, which is the whole
 * point of the section: a board with several times the room gives the organisms somewhere to travel to, so
 * gliders cross open space and collisions have consequences instead of immediately hitting an edge.
 *
 * A phone is a quarter of the width, so its cells shrink again — otherwise the board is twenty columns wide
 * and there is nowhere to spread out. Read once, like the demo grids' own cell counts: the simulation is
 * built around a fixed cell size, and re-reading it mid-life would mean rebuilding the board on every reflow.
 */
const CELL = window.matchMedia('(max-width: 639px)').matches ? 14 : 18;

const board = useTemplateRef<InstanceType<typeof LifeBoard>>('board');

const rules = [
    { name: 'Survival', text: 'Any cell with either 2 or 3 neighbors survives for the next round.' },
    { name: 'Underpopulation', text: 'Any cell with fewer than 2 neighbors dies.' },
    { name: 'Overpopulation', text: 'Any cell with more than 3 neighbors dies.' },
    { name: 'Reproduction', text: 'Any dead cell with exactly 3 live neighbors becomes a living cell.' }
];

/** The real neighbour lookup this board runs on, trimmed to the four straight steps. */
const snippet = `const grid = new SelfAwareGrid(gridElement, cellSize);

// The eight neighbours of a cell, without knowing how wide the grid is.
const neighboursOf = (i) => [
    grid.isTopRow(i)      ? -1 : grid.getGridItemAbove(i),
    grid.isBottomRow(i)   ? -1 : grid.getGridItemBelow(i),
    grid.isLeftColumn(i)  ? -1 : grid.getGridItemToTheLeft(i, true),
    grid.isRightColumn(i) ? -1 : grid.getGridItemToTheRight(i),
    // ...and the four diagonals, by composing two of those steps.
].filter((index) => index >= 0);

// B3/S23 — the whole game, once you know who is next to whom.
next[i] = alive[i] ? (count === 2 || count === 3) : count === 3;`;
</script>

<template>
    <section id="life" class="shell scroll-mt-20 py-14 sm:py-20">

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">02 &mdash; Game of Life</p>
        <h2 class="mt-3 font-display text-3xl font-extralight tracking-tight sm:text-4xl">Example: Conway&rsquo;s Game of Life</h2>

        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            The demo below uses SelfAwareGrid to power the navigation and spatial awareness of the organisms in a
            live example of Conway&rsquo;s Game of Life. Use the button below the demo to start it over with a
            random seed.
        </p>

        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Conway&rsquo;s Game of Life is a simple cellular simulation devised by John H. Conway in 1970. Despite
            its simple rules, the game results in immense complexity.
        </p>

        <h3 class="mt-8 font-display text-lg font-extralight tracking-tight">Rules:</h3>

        <ul class="mt-4 max-w-2xl space-y-3">
            <li v-for="rule in rules" :key="rule.name" class="flex gap-3">
                <span class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true"></span>
                <span class="text-base leading-relaxed text-ink-muted">
                    <strong class="font-semibold text-ink">{{ rule.name }}:</strong> {{ rule.text }}
                </span>
            </li>
        </ul>

        <div class="mt-8 flex flex-wrap gap-2 sm:gap-3">
            <StatChip label="Column count" :value="board?.columnCount ?? 0" />
            <StatChip label="Row count" :value="board?.rowCount ?? 0" />
            <StatChip label="Population" :value="board?.population ?? 0" />
        </div>

        <div class="mt-5">
            <LifeBoard
                ref="board"
                class="life-panel"
                :cell="CELL"
                :step-ms="320"
                :fade-ms="200"
                :seed-density="0.28"
                label="Conway's Game of Life, running live on a grid measured by SelfAwareGrid"
            />
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" class="control-button" @click="board?.reseed()">Start over with a random seed</button>

            <p class="font-mono text-xs text-ink-muted">Every seed is different</p>
        </div>

        <div class="mt-6">
            <CodeBlock label="life.js" :code="snippet" />
        </div>
    </section>
</template>

<style scoped>
/*
 * The board is a panel here rather than a backdrop, so the cells are painted at full strength instead of the
 * hero's whisper. The alpha is a CSS variable precisely so a board can be re-themed without the renderer
 * knowing anything about where it is being used.
 */
.life-panel {
    --life-alive-alpha: 0.85;

    height: clamp(18rem, 48vw, 26rem);

    border: 1px solid var(--line);
    border-radius: 1rem;
    background-color: var(--panel);
}
</style>
