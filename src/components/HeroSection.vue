<script setup lang="ts">
import { ref } from 'vue';

const command = 'npm install self-aware-grid';
const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

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

            <h1 class="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                Grid children that know
                <span class="text-brand-500">where they are</span>.
            </h1>

            <p class="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
                A tiny, dependency-free library that measures a CSS grid as it reflows and gives every child a sense
                of its own position &mdash; so you can style rows, columns and corners responsively, and navigate
                cells with the arrow keys.
            </p>

            <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
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

            <dl class="mt-12 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                <div v-for="item in [
                    { term: 'Zero dependencies', detail: 'Plain DOM and a ResizeObserver. Nothing else.' },
                    { term: 'Framework agnostic', detail: 'It takes an element. This demo happens to use Vue.' },
                    { term: 'Reflow aware', detail: 'Measurements follow the grid at any width.' }
                ]" :key="item.term">
                    <dt class="font-medium text-ink">{{ item.term }}</dt>
                    <dd class="mt-1 text-sm leading-relaxed text-ink-muted">{{ item.detail }}</dd>
                </div>
            </dl>
        </div>
    </section>
</template>
