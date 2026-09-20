<script setup lang="ts">
import LogoMark from './LogoMark.vue';
import { useTheme } from '../composables/useTheme';
import { useScrollSpy } from '../composables/useScrollSpy';

const sections = [
    { id: 'navigation', label: 'Navigation' },
    { id: 'life', label: 'Game of Life' },
    { id: 'styling', label: 'Styling' },
    { id: 'docs', label: 'Docs' }
];

const { theme, toggle } = useTheme();

// No section is current while the reader is still in the hero, so nothing is highlighted up there.
const { active } = useScrollSpy(sections.map((section) => section.id));
</script>

<template>
    <header class="sticky top-0 z-50 border-b border-line/70 bg-surface/80 backdrop-blur-md">
        <div class="shell flex h-16 items-center justify-between gap-3">

            <a href="#top" class="flex min-w-0 items-center gap-2 sm:gap-2.5">
                <LogoMark class="h-8 w-8 shrink-0 rounded-lg" />
                <!-- Below 360px the third button leaves too little room for the wordmark; the mark alone carries it. -->
                <span class="hidden truncate font-display text-lg font-normal tracking-tight min-[360px]:block sm:text-xl">SelfAwareGrid</span>
            </a>

            <!--
                The same treatment as the docs contents list: the current section gets the full style, and
                hovering a different link previews it in a dimmer form. Active classes replace the hover ones
                rather than sitting under them, so hovering the current link changes nothing.
            -->
            <nav class="hidden items-center gap-6 text-sm md:flex">
                <a
                    v-for="section in sections"
                    :key="section.id"
                    class="border-b-2 pb-0.5 transition-colors duration-150"
                    :class="active === section.id
                        ? 'border-brand-500 text-ink'
                        : 'border-transparent text-ink-muted hover:border-brand-500/40 hover:text-ink/70'"
                    :aria-current="active === section.id ? 'location' : undefined"
                    :href="`#${section.id}`"
                >{{ section.label }}</a>
            </nav>

            <div class="flex shrink-0 items-center gap-2">
                <a
                    class="rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink sm:px-3 sm:text-sm"
                    href="https://github.com/JaidenDeChon/SelfAwareGrid"
                    target="_blank"
                    rel="noreferrer"
                >GitHub</a>

                <a
                    class="rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink sm:px-3 sm:text-sm"
                    href="https://www.npmjs.com/package/self-aware-grid"
                    target="_blank"
                    rel="noreferrer"
                >npm</a>

                <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink"
                    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
                    @click="toggle"
                >
                    <svg v-if="theme === 'dark'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </svg>
                    <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                    </svg>
                </button>
            </div>
        </div>
    </header>
</template>
