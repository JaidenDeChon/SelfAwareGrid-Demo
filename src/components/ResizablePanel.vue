<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const props = withDefaults(defineProps<{
    /** Smallest width the panel may be dragged to, in pixels. */
    minWidth?: number;
    /** Accessible name for the drag handle. */
    label?: string;
    /**
     * How much of the available width to start at, on screens wide enough for it to be worth it. Starting a
     * little short of full width means the grid opens with visible middle rows, not only edges.
     */
    initialFraction?: number;
}>(), {
    minWidth: 150,
    label: 'Resize the grid container',
    initialFraction: 1
});

const track = useTemplateRef<HTMLElement>('track');

const maxWidth = ref(0);
const width = ref(0);
const dragging = ref(false);

let trackObserver: ResizeObserver | null = null;
let pointerStartX = 0;
let pointerStartWidth = 0;

/** Until the track has been measured the panel just fills its parent. */
const panelStyle = computed(() => (width.value > 0 ? { width: `${Math.round(width.value)}px` } : undefined));

const percentage = computed(() => {
    if (!maxWidth.value) return 100;
    return Math.round((width.value / maxWidth.value) * 100);
});

function clamp (value: number): number {
    const upper = Math.max(maxWidth.value, props.minWidth);
    return Math.min(Math.max(value, props.minWidth), upper);
}

function setWidth (value: number): void {
    width.value = clamp(value);
}

function measureTrack (): void {
    if (!track.value) return;
    maxWidth.value = track.value.clientWidth;

    // First measurement: open at the requested fraction, but only where there is room to spare.
    if (width.value === 0) {
        width.value = clamp(maxWidth.value >= 560 ? maxWidth.value * props.initialFraction : maxWidth.value);
        return;
    }

    width.value = clamp(width.value);
}

/*
 * Pointer events rather than the CSS `resize` property: `resize: horizontal` is ignored by every mobile browser,
 * and on iOS Safari it never renders a grabbable corner at all. Pointer events cover mouse, pen and touch with
 * the same handlers, and `setPointerCapture` keeps the drag alive when the finger leaves the handle.
 */
function onPointerDown (event: PointerEvent): void {
    // Ignore secondary mouse buttons, but let touch and pen through.
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragging.value = true;
    pointerStartX = event.clientX;
    pointerStartWidth = width.value;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
}

function onPointerMove (event: PointerEvent): void {
    if (!dragging.value) return;
    // Stops iOS from turning the drag into a page scroll or a pull-to-refresh.
    event.preventDefault();
    setWidth(pointerStartWidth + (event.clientX - pointerStartX));
}

function onPointerUp (event: PointerEvent): void {
    if (!dragging.value) return;
    dragging.value = false;
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
}

function onKeydown (event: KeyboardEvent): void {
    const step = event.shiftKey ? 64 : 16;

    switch (event.key) {
        case 'ArrowLeft': setWidth(width.value - step); break;
        case 'ArrowRight': setWidth(width.value + step); break;
        case 'Home': setWidth(props.minWidth); break;
        case 'End': setWidth(maxWidth.value); break;
        default: return;
    }

    event.preventDefault();
}

function onSliderInput (event: Event): void {
    setWidth(Number((event.target as HTMLInputElement).value));
}

onMounted(() => {
    measureTrack();
    trackObserver = new ResizeObserver(() => measureTrack());
    if (track.value) trackObserver.observe(track.value);
});

onBeforeUnmount(() => {
    trackObserver?.disconnect();
    trackObserver = null;
});
</script>

<template>
    <div ref="track" class="w-full">

        <div
            class="relative rounded-2xl border border-line bg-panel shadow-sm transition-shadow duration-150"
            :class="dragging ? 'shadow-lg ring-2 ring-brand-500/60' : ''"
            :style="panelStyle"
        >
            <!-- The grid content. Padded on the right so nothing hides beneath the handle. -->
            <div class="overflow-hidden rounded-2xl p-3 pr-9 sm:p-4 sm:pr-11">
                <slot />
            </div>

            <!--
                The handle spans the full height of the panel so it is easy to hit with a thumb.
                `touch-action: none` is what stops mobile Safari from claiming the gesture for scrolling.
            -->
            <div
                role="separator"
                aria-orientation="vertical"
                tabindex="0"
                :aria-label="props.label"
                :aria-valuenow="percentage"
                aria-valuemin="0"
                aria-valuemax="100"
                class="group absolute inset-y-0 right-0 flex w-8 cursor-ew-resize touch-none select-none items-center justify-center rounded-r-2xl sm:w-10"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
                @keydown="onKeydown"
            >
                <span
                    class="flex h-20 w-5 items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/10 transition-colors duration-150 group-hover:border-brand-500 group-hover:bg-brand-500/25"
                    :class="dragging ? 'border-brand-500 bg-brand-500/15' : ''"
                >
                    <span class="flex gap-[3px]" aria-hidden="true">
                        <span class="h-7 w-px rounded bg-brand-500"></span>
                        <span class="h-7 w-px rounded bg-brand-500"></span>
                    </span>
                </span>
            </div>
        </div>

        <!-- A slider mirrors the handle: precise on a desktop, and far friendlier than dragging on a phone. -->
        <div class="mt-3 flex items-center gap-3">
            <input
                type="range"
                class="h-9 min-w-0 flex-1 cursor-pointer accent-brand-500"
                :min="props.minWidth"
                :max="Math.max(maxWidth, props.minWidth)"
                :value="width"
                :aria-label="props.label"
                @input="onSliderInput"
            />
            <button
                type="button"
                class="shrink-0 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-xs text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-ink"
                @click="setWidth(maxWidth)"
            >
                {{ Math.round(width) }}px &middot; fit
            </button>
        </div>
    </div>
</template>
