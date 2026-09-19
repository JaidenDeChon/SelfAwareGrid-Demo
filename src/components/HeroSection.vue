<script setup lang="ts">
import { ref } from 'vue';

const command = 'npm install self-aware-grid';
const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

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

async function copy (): Promise<void> {
    try {
        await navigator.clipboard.writeText(command);
        copied.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => { copied.value = false; }, 1600);
    } catch {
        // Clipboard access can be blocked; the command is selectable either way.
    }
}
</script>

<template>
    <section id="top" class="relative overflow-hidden">

        <!-- Backdrop: a soft brand glow over a faint grid, which is on-theme for a grid library. -->
        <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]"></div>
            <div class="absolute left-1/2 top-[-14rem] h-[28rem] w-[46rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-brand-500/15 blur-[120px] dark:bg-brand-500/25"></div>
        </div>

        <div class="shell py-16 sm:py-24 lg:py-28">
            <p class="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-ink-muted">
                <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                self-aware-grid
            </p>

            <h1 class="mt-6 break-words text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
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

            <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                    href="#styling"
                    class="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-3 font-medium text-white transition-colors duration-150 hover:bg-brand-600"
                >Play with the demo</a>

                <button
                    type="button"
                    class="inline-flex items-center justify-between gap-4 rounded-xl border border-line bg-panel px-4 py-3 font-mono text-sm text-ink transition-colors duration-150 hover:border-brand-500"
                    @click="copy"
                >
                    <span class="truncate">{{ command }}</span>
                    <span class="shrink-0 text-xs text-ink-muted">{{ copied ? 'copied' : 'copy' }}</span>
                </button>
            </div>
        </div>
    </section>
</template>
