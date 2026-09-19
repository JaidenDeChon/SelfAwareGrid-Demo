<script setup lang="ts">
import InstallTabs from './InstallTabs.vue';
import LifeGrid from './LifeGrid.vue';

/*
 * Both bullet points are the package README's own wording, kept verbatim.
 */
const points = [
    {
        lead: 'Responsively',
        rest: ' styling specific grid columns, rows, and cells -- no more hard-coding a grid width for every ' +
            'resolution your app supports. You can now style rows and columns independently and without ' +
            'hard-coding an nth-column.'
    },
    {
        lead: '',
        rest: 'Enabling excel-like keyboard navigation of grid cells.'
    }
];
</script>

<template>
    <section id="top" class="relative overflow-hidden">

        <!--
            Backdrop: Conway's Game of Life, seeded afresh on every load, with SelfAwareGrid working out which
            cell neighbours which. Same 56px squares and the same fade as the static grid it replaces.
        -->
        <div class="pointer-events-none absolute inset-0 -z-10">
            <LifeGrid />
            <div class="hero-glow"></div>
        </div>

        <div class="shell py-16 sm:py-24 lg:py-28">
            <p class="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-ink-muted">
                <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                self-aware-grid
            </p>

            <h1 class="mt-6 break-words font-display text-4xl font-normal leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Self<span class="text-brand-500">Aware</span>Grid
            </h1>

            <p class="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
                SelfAwareGrid was created to add additional functionality to CSS grid, such as:
            </p>

            <ul class="mt-6 max-w-2xl space-y-4">
                <li v-for="point in points" :key="point.rest" class="flex gap-3">
                    <span class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true"></span>
                    <span class="text-base leading-relaxed text-ink-muted sm:text-lg">
                        <strong v-if="point.lead" class="font-semibold text-ink">{{ point.lead }}</strong>{{ point.rest }}
                    </span>
                </li>
            </ul>

            <div class="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-4">
                <a
                    href="#styling"
                    class="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-500 px-5 py-3 font-medium text-white transition-colors duration-150 hover:bg-brand-600"
                >Try the demo</a>

                <div class="w-full sm:max-w-sm">
                    <InstallTabs />
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
/*
 * A painted gradient, not `filter: blur()`.
 *
 * The blurred version had to be re-rasterised every time the simulation underneath it drew a frame — a
 * 120px blur over a 736x448 box, sixty times a second — which both flickered in time with the loop and was
 * the single cause of every dropped frame on this page. A radial gradient is rasterised once and then only
 * composited, and at these radii it is indistinguishable from the blur it replaces.
 */
.hero-glow {
    position: absolute;
    top: -14rem;
    left: 50%;
    width: min(46rem, 140vw);
    height: 28rem;
    transform: translateX(-50%);

    background: radial-gradient(
        closest-side,
        color-mix(in srgb, var(--color-brand-500) 17%, transparent),
        color-mix(in srgb, var(--color-brand-500) 7%, transparent) 55%,
        transparent 100%
    );
}

:global(.dark) .hero-glow {
    background: radial-gradient(
        closest-side,
        color-mix(in srgb, var(--color-brand-500) 30%, transparent),
        color-mix(in srgb, var(--color-brand-500) 12%, transparent) 55%,
        transparent 100%
    );
}
</style>
