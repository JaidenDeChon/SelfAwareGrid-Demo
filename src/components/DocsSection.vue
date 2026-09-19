<script setup lang="ts">
import CodeBlock from './CodeBlock.vue';
import { docsHeadings, docsHtml } from '../docs';

const install = 'npm install self-aware-grid';
</script>

<template>
    <section id="docs" class="shell scroll-mt-20 border-t border-line py-14 sm:py-20">

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">03 &mdash; Docs</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Documentation</h2>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Straight from the
            <a
                class="text-ink underline decoration-brand-500 underline-offset-4"
                href="https://github.com/JaidenDeChon/SelfAwareGrid"
                target="_blank"
                rel="noreferrer"
            >package repository</a>, so it always matches the version this demo is built against.
        </p>

        <div class="mt-10 gap-10 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">

            <!-- Contents. Sticky alongside the docs once there is room for a second column. -->
            <nav class="mb-10 lg:mb-0" aria-label="Documentation contents">
                <div class="lg:sticky lg:top-24">
                    <p class="font-mono text-xs uppercase tracking-wider text-ink-muted">Contents</p>
                    <ul class="mt-3 space-y-1.5 border-l border-line">
                        <li v-for="heading in docsHeadings" :key="heading.id">
                            <a
                                class="-ml-px block border-l border-transparent py-0.5 text-sm text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink"
                                :class="heading.depth === 3 ? 'pl-6' : 'pl-3 font-medium text-ink'"
                                :href="`#${heading.id}`"
                            >{{ heading.text }}</a>
                        </li>
                    </ul>
                </div>
            </nav>

            <div class="min-w-0">
                <h3 class="scroll-mt-24 text-xl font-semibold tracking-tight">Installation</h3>
                <div class="mt-3">
                    <CodeBlock label="terminal" :code="install" />
                </div>

                <!--
                    The README is trusted content: it ships inside the dependency this site installs, and it is
                    rendered once at module scope rather than on every render.
                -->
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="markdown mt-12" v-html="docsHtml"></div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.markdown :deep(h2) {
    scroll-margin-top: 6rem;
    margin-top: 3rem;

    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
}

.markdown :deep(h2:first-child) {
    margin-top: 0;
}

.markdown :deep(h3) {
    scroll-margin-top: 6rem;
    margin-top: 2.25rem;

    font-size: 1.125rem;
    font-weight: 600;
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

/* Inline code, as opposed to a fenced block. */
.markdown :deep(:not(pre) > code) {
    padding: 0.05rem 0.35rem;

    border-radius: 0.3rem;
    background-color: var(--raised);

    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.85em;
}

.markdown :deep(pre) {
    overflow-x: auto;
    margin-top: 1rem;
    padding: 0.9rem 1rem;

    border: 1px solid var(--line);
    border-radius: 0.6rem;
    background-color: var(--raised);
}

.markdown :deep(pre code) {
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    line-height: 1.65;
}
</style>
