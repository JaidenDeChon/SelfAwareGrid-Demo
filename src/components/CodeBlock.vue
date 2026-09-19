<script setup lang="ts">
import { computed, ref } from 'vue';
import { highlight } from '../highlight';

const props = withDefaults(defineProps<{
    code: string;
    /** Header text. In the docs this is the snippet's own leading comment. */
    label?: string;
    lang?: string;
}>(), {
    lang: 'javascript'
});

const rendered = computed(() => highlight(props.code, props.lang));

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
        <div class="flex items-start justify-between gap-3 border-b border-line px-4 py-2">
            <span class="font-mono text-xs leading-relaxed text-ink-muted">{{ label ?? lang }}</span>
            <button
                type="button"
                class="mt-px shrink-0 rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink"
                @click="copy"
            >{{ copied ? 'copied' : 'copy' }}</button>
        </div>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <pre class="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed text-ink"><code v-html="rendered"></code></pre>
    </div>
</template>
