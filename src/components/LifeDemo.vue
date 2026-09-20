<script setup lang="ts">
import { useTemplateRef } from 'vue';
import LifeBoard from './LifeBoard.vue';
import CodeBlock from './CodeBlock.vue';
import StatChip from './StatChip.vue';
// The sample below the board is a real file rather than a string, so it cannot quietly drift into
// something that would not run. `src/snippets/` holds nothing else the app imports.
import lifeSnippet from '../snippets/life.js?raw';

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
</script>

<template>
    <section id="life" class="scroll-mt-20 py-14 sm:py-20">

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">02 &mdash; Game of Life</p>
        <h3 class="mt-3 font-display text-2xl font-extralight tracking-tight sm:text-3xl">Conway&rsquo;s Game of Life</h3>

        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            The demo below is Conway&rsquo;s Game of Life, powered by SelfAwareGrid&rsquo;s positional awareness
            capabilities.
        </p>

        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Devised by John H. Conway in 1970 and beloved in mathematics, Conway&rsquo;s Game of Life is a simple
            cellular simulation. Despite its simple rules, it produces immense complexity based on its beginning
            state entirely. Each cell must be aware of its surroundings in order to know what to do on the next
            game loop, and the SelfAwareGrid makes exactly that possible.
        </p>

        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            This version of the simulation has a small twist compared to the original. To prevent the board from
            eventually reaching a state where no more progress will be made, if the board becomes too still,
            shapes that naturally traverse the board (called &ldquo;gliders&rdquo;) will be dispersed randomly to
            keep things moving.
        </p>

        <h4 class="mt-8 font-display text-lg font-extralight tracking-tight">Rules:</h4>

        <ul class="mt-4 max-w-2xl space-y-3">
            <li v-for="rule in rules" :key="rule.name" class="flex gap-3">
                <span class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true"></span>
                <span class="text-base leading-relaxed text-ink-muted">
                    <strong class="font-semibold text-ink">{{ rule.name }}:</strong> {{ rule.text }}
                </span>
            </li>
        </ul>

        <!--
            The readouts and the re-seed button share one row: chips from the left, button pushed to the far
            right. Every item wraps, so a narrow viewport breaks the row over as many lines as it needs, and
            below `sm` the button drops to a full-width line of its own rather than being squeezed in beside
            a chip.
        -->
        <div class="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">
            <StatChip label="Column count" :value="board?.columnCount ?? 0" />
            <StatChip label="Row count" :value="board?.rowCount ?? 0" />
            <StatChip label="Population" :value="board?.population ?? 0" />

            <button
                type="button"
                class="control-button w-full sm:ml-auto sm:w-auto"
                @click="board?.reseed()"
            >Start over with a random seed</button>
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

        <div class="mt-6">
            <CodeBlock label="life.js" :code="lifeSnippet" max-height="min(40rem, 70vh)" />
        </div>
    </section>
</template>

<style scoped>
/*
 * The board is a panel here rather than a backdrop, so the cells sit at full strength instead of the hero's
 * whisper. Both boards are the same elements; only this one line separates them, which is what the cells
 * being ordinary grid children buys.
 */
.life-panel {
    --life-alive-alpha: 0.85;

    height: clamp(18rem, 48vw, 26rem);

    border: 1px solid var(--line);
    border-radius: 1rem;
    background-color: var(--panel);
}
</style>
