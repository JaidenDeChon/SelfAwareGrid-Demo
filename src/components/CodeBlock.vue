<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ code: string; label?: string }>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy (): Promise<void> {
    try {
        await navigator.clipboard.writeText(props.code);
        copied.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => { copied.value = false; }, 1600);
    } catch {
        // Clipboard access can be blocked; the code is selectable either way.
    }
}
</script>

<template>
    <div class="w-full min-w-0 overflow-hidden rounded-xl border border-line bg-raised">

        <!-- The copy button lives in its own row rather than floating over the code, which would sit on top of
             long lines once the block scrolls sideways on a phone. -->
        <div class="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
            <span class="truncate font-mono text-xs text-ink-muted">{{ label ?? 'example' }}</span>
            <button
                type="button"
                class="shrink-0 rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink"
                @click="copy"
            >{{ copied ? 'copied' : 'copy' }}</button>
        </div>

        <pre class="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed text-ink"><code>{{ code }}</code></pre>
    </div>
</template>
