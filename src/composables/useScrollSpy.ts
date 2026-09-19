import { onBeforeUnmount, onMounted, ref } from 'vue';

interface ScrollSpyOptions {
    /**
     * How far below the top of the viewport a section starts counting as "current". Sections scroll to
     * their `scroll-margin` under the sticky header, so this sits a little past that.
     */
    offset?: number;
    /** Whether the first id stays selected while the reader is still above it. */
    fallbackToFirst?: boolean;
}

/**
 * Tracks which of the given element ids the reader is currently inside: the last one whose top has passed
 * the offset line. Shared by the docs contents list and the header navigation so the two behave alike.
 */
export function useScrollSpy (ids: string[], options: ScrollSpyOptions = {}) {
    const { offset = 120, fallbackToFirst = false } = options;

    const active = ref(fallbackToFirst ? ids[0] ?? '' : '');

    let frame = 0;
    let onScroll: (() => void) | null = null;

    function update (): void {
        let current = fallbackToFirst ? ids[0] ?? '' : '';

        for (const id of ids) {
            const element = document.getElementById(id);
            if (element && element.getBoundingClientRect().top <= offset) current = id;
        }

        active.value = current;
    }

    onMounted(() => {
        onScroll = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(update);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        update();
    });

    onBeforeUnmount(() => {
        cancelAnimationFrame(frame);
        if (onScroll) window.removeEventListener('scroll', onScroll);
    });

    return { active };
}
