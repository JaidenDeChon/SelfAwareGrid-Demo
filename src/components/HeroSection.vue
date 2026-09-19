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
            <div class="absolute left-1/2 top-[-14rem] h-[28rem] w-[46rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-brand-500/15 blur-[120px] dark:bg-brand-500/25"></div>
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
