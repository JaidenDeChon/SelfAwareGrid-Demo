import { onBeforeUnmount, onMounted, ref, shallowRef, type Ref } from 'vue';
import SelfAwareGrid from 'self-aware-grid';

/**
 * Wraps a `SelfAwareGrid` instance so its measurements are readable as Vue state.
 *
 * The library keeps the positional classnames up to date through its own `ResizeObserver`; this adds a second
 * observer — registered afterwards, so it runs once the library has recalculated — purely to mirror the numbers
 * into refs the templates can render.
 */
export function useSelfAwareGrid (element: Ref<HTMLElement | null>) {

    const grid = shallowRef<SelfAwareGrid | null>(null);
    const columnCount = ref(0);
    const rowCount = ref(0);

    let observer: ResizeObserver | null = null;

    /** Re-reads the grid's measurements into reactive state. */
    function sync (): void {
        if (!grid.value) return;
        grid.value.measureAndSetAllGridValues();
        columnCount.value = grid.value.columnCount();
        rowCount.value = grid.value.rowCount();
    }

    /**
     * Re-collects the grid's children and reassigns classnames. Call this whenever the number of children changes —
     * the library listens for the long-deprecated `DOMSubtreeModified` event, which no current browser still fires.
     */
    function refresh (): void {
        grid.value?.setupChildren();
        sync();
    }

    onMounted(() => {
        if (!element.value) return;

        // `allowZeroColumns: false` keeps the readout at a minimum of one column on very narrow screens.
        grid.value = new SelfAwareGrid(element.value, undefined, false);
        grid.value.beginObservingResize();

        observer = new ResizeObserver(() => sync());
        observer.observe(element.value);

        sync();
    });

    onBeforeUnmount(() => {
        observer?.disconnect();
        observer = null;
        grid.value?.destroy();
        grid.value = null;
    });

    return { grid, columnCount, rowCount, refresh, sync };
}
