<script setup lang="ts">
import { computed, ref } from 'vue';

const managers = [
    { id: 'npm', command: 'npm install self-aware-grid' },
    { id: 'pnpm', command: 'pnpm add self-aware-grid' },
    { id: 'yarn', command: 'yarn add self-aware-grid' },
    { id: 'bun', command: 'bun add self-aware-grid' },
    { id: 'deno', command: 'deno add npm:self-aware-grid' }
];

const active = ref(managers[0].id);
const command = computed(() => managers.find((m) => m.id === active.value)?.command ?? managers[0].command);

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy (): Promise<void> {
    try {
        await navigator.clipboard.writeText(command.value);
        copied.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => { copied.value = false; }, 1600);
    } catch {
        // Clipboard access can be blocked; the command is selectable either way.
    }
}
</script>

<template>
    <!--
        Two stacked boxes that read as one outline, in the same weight and colour as every other snippet on
        the page. The header drops its bottom border so the command's top border is the single line between
        them — which means the whole of the command's outline, divider included, is what turns blue on hover,
        while the header's stays put.
    -->
    <div class="w-full min-w-0">

        <div
            class="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-line bg-raised px-3 py-2"
            role="tablist"
            aria-label="Package manager"
        >
            <button
                v-for="manager in managers"
                :key="manager.id"
                type="button"
                role="tab"
                :aria-selected="active === manager.id"
                class="rounded-md px-2 py-0.5 font-mono text-xs transition-colors duration-150"
                :class="active === manager.id
                    ? 'bg-brand-500/15 text-brand-500'
                    : 'text-ink-muted hover:text-ink'"
                @click="active = manager.id"
            >{{ manager.id }}</button>
        </div>

        <!-- Square top corners, since the header sits directly on this border. -->
        <button
            type="button"
            class="install-command flex w-full items-center justify-between gap-4 rounded-b-xl border border-line bg-raised px-4 py-3 text-left font-mono text-sm text-ink transition-colors duration-150"
            :aria-label="`Copy: ${command}`"
            @click="copy"
        >
            <span class="truncate">{{ command }}</span>
            <span class="copy-hint shrink-0 text-xs text-ink-muted transition-colors duration-150">
                {{ copied ? 'copied' : 'copy' }}
            </span>
        </button>
    </div>
</template>

<style scoped>
.install-command {
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
}

.install-command:hover,
.install-command:focus-visible {
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand-500) 14%, transparent);
}

.install-command:hover .copy-hint,
.install-command:focus-visible .copy-hint {
    color: var(--color-brand-500);
}

@media (prefers-reduced-motion: reduce) {
    .install-command {
        transition: none;
    }
}
</style>
