<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import CodeBlock from './CodeBlock.vue';
import InstallTabs from './InstallTabs.vue';
import { docsHeadings, docsParts } from '../docs';

const activeHeading = ref(docsHeadings[0]?.id ?? '');

let frame = 0;
let onScroll: (() => void) | null = null;

/** Marks the heading the reader is currently under: the last one to have passed the top of the viewport. */
function updateActiveHeading (): void {
    // Headings scroll to 6rem (their scroll-margin) under the sticky header. Allowing a little more than
    // that keeps a heading parked at exactly its anchor on the right side of the comparison, where
    // sub-pixel layout would otherwise push it just past the line.
    const line = 120;
    let current = docsHeadings[0]?.id ?? '';

    for (const heading of docsHeadings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= line) current = heading.id;
    }

    activeHeading.value = current;
}

onMounted(() => {
    onScroll = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(updateActiveHeading);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateActiveHeading();
});

onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    if (onScroll) window.removeEventListener('scroll', onScroll);
});
</script>

<template>
    <section id="docs" class="shell scroll-mt-20 border-t border-line py-14 sm:py-20">

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">03 &mdash; Docs</p>
        <h2 class="mt-3 font-display text-3xl font-extralight tracking-tight sm:text-4xl">Documentation</h2>

        <div class="mt-10 gap-10 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">

            <!-- Contents. Sticky alongside the docs once there is room for a second column. -->
            <nav class="mb-10 lg:mb-0" aria-label="Documentation contents">
                <div class="lg:sticky lg:top-24">
                    <p class="font-mono text-xs uppercase tracking-wider text-ink-muted">Contents</p>
                    <ul class="mt-3 space-y-1.5 border-l border-line">
                        <li v-for="heading in docsHeadings" :key="heading.id">
                            <!--
                                The active entry gets the full treatment. Hovering a different entry previews
                                it in a dimmer form; hovering the active one changes nothing, because its
                                classes replace the hover ones rather than sitting underneath them.
                            -->
                            <a
                                class="-ml-px block border-l py-0.5 text-sm transition-colors duration-150"
                                :class="[
                                    heading.depth === 3 ? 'pl-6' : 'pl-3 font-medium',
                                    activeHeading === heading.id
                                        ? 'border-brand-500 text-ink'
                                        : 'border-transparent text-ink-muted hover:border-brand-500/40 hover:text-ink/70'
                                ]"
                                :aria-current="activeHeading === heading.id ? 'location' : undefined"
                                :href="`#${heading.id}`"
                            >{{ heading.text }}</a>
                        </li>
                    </ul>
                </div>
            </nav>

            <div class="min-w-0">
                <h3 class="scroll-mt-24 font-display text-xl font-extralight tracking-tight">Installation</h3>
                <div class="mt-4 max-w-md">
                    <InstallTabs />
                </div>

                <div class="mt-12 space-y-4">
                    <template v-for="(part, index) in docsParts" :key="index">
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <div v-if="part.kind === 'html'" class="markdown" v-html="part.html"></div>
                        <CodeBlock v-else :label="part.label" :code="part.code" :lang="part.lang" />
                    </template>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.markdown :deep(h2) {
    scroll-margin-top: 6rem;
    margin-top: 3rem;

    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 200;
    letter-spacing: -0.01em;
}

.markdown:first-child :deep(h2:first-child) {
    margin-top: 0;
}

.markdown :deep(h3) {
    scroll-margin-top: 6rem;
    margin-top: 2.25rem;

    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 200;
}

.markdown :deep(p) {
    margin-top: 1rem;
    color: var(--ink-muted);
    line-height: 1.75;
}

.markdown :deep(ul) {
    margin-top: 1rem;
    padding-left: 1.1rem;
    list-style: disc;
}

.markdown :deep(li) {
    margin-top: 0.5rem;
    color: var(--ink-muted);
    line-height: 1.7;
}

.markdown :deep(li)::marker {
    color: var(--color-brand-500);
}

.markdown :deep(strong) {
    color: var(--ink);
    font-weight: 600;
}

.markdown :deep(a) {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--color-brand-500);
    text-underline-offset: 4px;
}

.markdown :deep(code) {
    padding: 0.05rem 0.35rem;

    border-radius: 0.3rem;
    background-color: var(--raised);

    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.85em;
    overflow-wrap: anywhere;
}
</style>
