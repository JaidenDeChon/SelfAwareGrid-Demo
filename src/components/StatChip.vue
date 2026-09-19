<script setup lang="ts">
defineProps<{ label: string; value: number | string }>();
</script>

<template>
    <div class="flex items-baseline gap-2 rounded-xl border border-line bg-panel px-3.5 py-2">
        <span class="font-mono text-xl font-semibold tabular-nums text-brand-500 sm:text-2xl">{{ value }}</span>
        <span class="font-mono text-xs uppercase tracking-wider text-ink-muted">{{ label }}</span>
    </div>
</template>
