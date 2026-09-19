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
    <div class="w-full min-w-0">

        <!--
            The header carries no border of its own: the command below owns the only outline, so there is a
            single line between the two and it is the one that lights up on hover.
        -->
        <div class="flex flex-wrap items-center gap-1 px-1 pb-1.5" role="tablist" aria-label="Package manager">
            <button
                v-for="manager in managers"
                :key="manager.id"
                type="button"
                role="tab"
                :aria-selected="active === manager.id"
                class="rounded-md px-2.5 py-1 font-mono text-xs transition-colors duration-150"
                :class="active === manager.id
                    ? 'bg-brand-500/12 text-brand-500'
                    : 'text-ink-muted hover:text-ink'"
                @click="active = manager.id"
            >{{ manager.id }}</button>
        </div>

        <!--
            Square top corners, because the header sits directly on top of this border rather than carrying
            its own. The whole box is the copy button, which is the nicest target on a phone.
        -->
        <button
            type="button"
            class="group flex w-full items-center justify-between gap-4 rounded-b-xl rounded-t-none border border-brand-500/45 bg-panel px-4 py-3 text-left font-mono text-sm text-ink transition-colors duration-150 hover:border-brand-500 hover:bg-brand-500/5"
            :aria-label="`Copy: ${command}`"
            @click="copy"
        >
            <span class="truncate">{{ command }}</span>
            <span class="shrink-0 text-xs text-ink-muted transition-colors duration-150 group-hover:text-brand-500">
                {{ copied ? 'copied' : 'copy' }}
            </span>
        </button>
    </div>
</template>
