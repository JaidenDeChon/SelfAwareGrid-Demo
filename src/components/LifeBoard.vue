<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useGameOfLife } from '../composables/useGameOfLife';

const props = withDefaults(defineProps<{
    /** Size of one cell, in CSS pixels. Smaller cells mean a bigger board for the organisms to spread across. */
    cell?: number;
    /** Milliseconds between generations. */
    stepMs?: number;
    /** How long a birth or a death takes to fade. */
    fadeMs?: number;
    /** Share of cells alive in a fresh seed. */
    seedDensity?: number;
    /** Keep a settled board moving with gliders, and re-seed one that dies out. */
    sustain?: boolean;
    /**
     * Accessible name. A board with one is announced as an image; one without — the hero backdrop — is
     * decorative and hidden from assistive technology entirely.
     */
    label?: string;
}>(), {
    cell: 56,
    stepMs: 700,
    fadeMs: 260,
    seedDensity: 0.3,
    sustain: true,
    label: undefined
});

const container = useTemplateRef<HTMLElement>('container');
const gridElement = useTemplateRef<HTMLElement>('gridElement');

const { cellCount, columnCount, rowCount, population, generation, reseed } = useGameOfLife(
    { container, gridElement },
    props
);

defineExpose({ reseed, columnCount, rowCount, population, generation });
</script>

<template>
    <div
        ref="container"
        class="life"
        :style="{ '--life-cell': `${cell}px`, '--life-fade': `${fadeMs}ms` }"
        :role="label ? 'img' : undefined"
        :aria-label="label"
        :aria-hidden="label ? undefined : 'true'"
    >
        <!--
            The cells are the grid's children, and nothing else draws them: SelfAwareGrid measures exactly
            the elements you are looking at, which is the whole claim the demo is making.
        -->
        <div ref="gridElement" class="life-grid">
            <div v-for="index in cellCount" :key="index" class="life-cell"></div>
        </div>
    </div>
</template>

<style scoped>
.life {
    position: relative;
    overflow: hidden;

    /* Grid lines in CSS, as the static backdrop drew them: painted once, never per generation. */
    background-image:
        linear-gradient(to right, var(--line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--line) 1px, transparent 1px);
    background-size: var(--life-cell) var(--life-cell);
}

.life-grid {
    position: absolute;
    inset: 0;

    display: grid;
    grid-template-columns: repeat(auto-fill, var(--life-cell));
    column-gap: 0;
    row-gap: 0;
}

/*
 * A cell is always there and always coloured; only its opacity moves.
 *
 * That matters: opacity is one of the two things a browser can change without repainting the element, so a
 * generation costs a composite rather than several hundred fills. Colour comes from tokens the theme swaps,
 * so switching themes needs no redraw and no JavaScript at all.
 */
.life-cell {
    width: var(--life-cell);
    height: var(--life-cell);

    background-color: rgb(var(--life-alive-rgb) / var(--life-alive-alpha));
    opacity: 0;

    transition: opacity var(--life-fade) ease-out;
}

.life-cell.is-alive {
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .life-cell {
        transition: none;
    }
}
</style>
