<script setup lang="ts">
import LogoMark from './LogoMark.vue';
import { useTheme } from '../composables/useTheme';

const { theme, toggle } = useTheme();
</script>

<template>
    <header class="sticky top-0 z-50 border-b border-line/70 bg-surface/80 backdrop-blur-md">
        <div class="shell flex h-16 items-center justify-between gap-4">

            <a href="#top" class="flex items-center gap-2.5">
                <LogoMark class="h-8 w-8 rounded-lg" />
                <span class="text-lg font-semibold tracking-tight">SelfAwareGrid</span>
            </a>

            <nav class="hidden items-center gap-6 text-sm text-ink-muted md:flex">
                <a class="transition-colors duration-150 hover:text-ink" href="#styling">Classnames</a>
                <a class="transition-colors duration-150 hover:text-ink" href="#navigation">Navigation</a>
                <a class="transition-colors duration-150 hover:text-ink" href="#install">Install</a>
            </nav>

            <div class="flex items-center gap-2">
                <a
                    class="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink"
                    href="https://github.com/JaidenDeChon/SelfAwareGrid"
                    target="_blank"
                    rel="noreferrer"
                >GitHub</a>

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
