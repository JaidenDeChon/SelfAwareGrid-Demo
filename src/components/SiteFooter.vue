<script setup lang="ts">
import LogoMark from './LogoMark.vue';

const links = [
    { label: 'GitHub', href: 'https://github.com/JaidenDeChon/SelfAwareGrid' },
    { label: 'npm', href: 'https://www.npmjs.com/package/self-aware-grid' },
    { label: 'Demo source', href: 'https://github.com/JaidenDeChon/SelfAwareGrid-Demo' },
    { label: 'jaiden.dev', href: 'https://jaiden.dev', brand: true }
];
</script>

<template>
    <footer class="border-t border-line">
        <div class="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">

            <div class="flex items-center gap-3">
                <LogoMark class="h-7 w-7 rounded-md" />
                <p class="text-sm text-ink-muted">
                    SelfAwareGrid &mdash; built by
                    <a class="text-ink underline decoration-brand-500 underline-offset-4" href="https://jaiden.dev">Jaiden DeChon</a>
                </p>
            </div>

            <nav class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                <a
                    v-for="link in links"
                    :key="link.label"
                    class="transition-colors duration-150"
                    :class="link.brand ? 'text-brand-500 hover:text-brand-400' : 'hover:text-ink'"
                    :href="link.href"
                    target="_blank"
                    rel="noreferrer"
                >{{ link.label }}</a>
            </nav>
        </div>
    </footer>
</template>
