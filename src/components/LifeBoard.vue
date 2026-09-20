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
const canvasElement = useTemplateRef<HTMLCanvasElement>('canvasElement');

const { cellCount, columnCount, rowCount, population, generation, reseed } = useGameOfLife(
    { container, gridElement, canvasElement },
    props
);

defineExpose({ reseed, columnCount, rowCount, population, generation });
</script>

<template>
    <div
        ref="container"
        class="life"
        :style="{ '--life-cell': `${cell}px` }"
        :role="label ? 'img' : undefined"
        :aria-label="label"
        :aria-hidden="label ? undefined : 'true'"
    >
        <!--
            The grid SelfAwareGrid measures. It is laid out but never painted: the canvas below draws every
            cell, so these exist purely so the library has a real, reflowing grid to answer questions about.
        -->
        <div ref="gridElement" class="life-grid">
            <div v-for="index in cellCount" :key="index" class="life-probe"></div>
        </div>

        <canvas ref="canvasElement" class="life-canvas"></canvas>
    </div>
</template>

<style scoped>
.life {
    position: relative;
    overflow: hidden;

    /* Grid lines in CSS, as the static backdrop drew them: painted once, never per frame. */
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

    visibility: hidden;
}

.life-probe {
    width: var(--life-cell);
    height: var(--life-cell);
}

.life-canvas {
    position: absolute;
    inset: 0;
}
</style>
