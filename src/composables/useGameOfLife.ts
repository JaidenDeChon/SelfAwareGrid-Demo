import { onBeforeUnmount, onMounted, ref, shallowRef, type Ref } from 'vue';
import SelfAwareGrid from 'self-aware-grid';

/** The elements the simulation needs: a box to fill, and the grid of cells inside it. */
export interface GameOfLifeElements {
    container: Ref<HTMLElement | null>;
    gridElement: Ref<HTMLElement | null>;
}

export interface GameOfLifeOptions {
    /** Size of one cell, in CSS pixels. The smaller it is, the more room the organisms have. */
    cell?: number;
    /** Milliseconds between generations. */
    stepMs?: number;
    /** Share of cells alive in a fresh seed. */
    seedDensity?: number;
    /**
     * Keep a settled board moving: drop gliders in once it goes quiet, and re-seed if it dies out or runs
     * for too long. Turning this off leaves the board to reach whatever end state the rules take it to.
     */
    sustain?: boolean;
}

/**
 * Conway's Game of Life, with SelfAwareGrid answering every question about who neighbours whom.
 *
 * The cells are the grid's own children. A living one carries `is-alive` and a dead one does not, so what
 * the library is measuring and what you are looking at are the same elements — which is the point of the
 * demo, and lets the stylesheet own everything about how a board looks, including the fade and the theme.
 *
 * The hero backdrop and the Game of Life section are this same simulation at different sizes, so the whole
 * of it lives here and the components using it only decide how big the cells are.
 */
export function useGameOfLife (elements: GameOfLifeElements, options: GameOfLifeOptions = {}) {

    const {
        cell: CELL = 56,
        stepMs: STEP_MS = 700,
        seedDensity: SEED_DENSITY = 0.3,
        sustain = true
    } = options;

    const { container, gridElement } = elements;

    const cellCount = ref(0);
    const columnCount = ref(0);
    const rowCount = ref(0);
    const population = ref(0);
    const generation = ref(0);

    const grid = shallowRef<SelfAwareGrid | null>(null);

    /** For each cell, the indices of its eight neighbours. Rebuilt whenever the grid reflows. */
    let neighbours: number[][] = [];
    let cells: Uint8Array = new Uint8Array(0);
    let previous: Uint8Array = new Uint8Array(0);

    let timer: ReturnType<typeof setInterval> | undefined;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;

    let onScreen = true;
    let quietGenerations = 0;
    let reducedMotion = false;

    /**
     * Builds the neighbour table using SelfAwareGrid itself.
     *
     * The library answers "what is above / below / left / right of this cell, given how the grid is currently
     * laid out", and knows which cells sit on an edge. The four diagonals come from composing two of those
     * steps. That is the whole topology Life needs, and none of it hard-codes a column count — when the board
     * reflows, the same calls give different answers and the table is simply rebuilt.
     */
    function buildNeighbours (): void {
        const instance = grid.value;
        if (!instance) return;

        const total = cells.length;

        const up = (i: number) => (instance.isTopRow(i) ? -1 : instance.getGridItemAbove(i));
        const down = (i: number) => (instance.isBottomRow(i) ? -1 : instance.getGridItemBelow(i));
        const left = (i: number) => (instance.isLeftColumn(i) ? -1 : instance.getGridItemToTheLeft(i, true));
        const right = (i: number) => (instance.isRightColumn(i) ? -1 : instance.getGridItemToTheRight(i));

        const inRange = (i: number) => i >= 0 && i < total;
        const step = (origin: number, move: (i: number) => number) => (inRange(origin) ? move(origin) : -1);

        neighbours = new Array(total);

        for (let i = 0; i < total; i++) {
            const u = up(i);
            const d = down(i);

            neighbours[i] = [
                u,
                d,
                left(i),
                right(i),
                step(u, left),
                step(u, right),
                step(d, left),
                step(d, right)
            ].filter(inRange);
        }
    }

    /**
     * Writes the board onto the cells.
     *
     * Only the ones that changed are touched. In a typical generation most cells hold their state, and a
     * class that is already there is not worth setting again — the diff is what keeps a board of two
     * thousand cells down to a couple of hundred DOM writes a generation.
     */
    function paintChanges (): void {
        const children = gridElement.value?.children;
        if (!children) return;

        for (let i = 0; i < cells.length; i++) {
            if (cells[i] === previous[i]) continue;
            (children[i] as HTMLElement | undefined)?.classList.toggle('is-alive', cells[i] === 1);
        }
    }

    /** Writes every cell, for when there is nothing sensible to diff against: a fresh seed or a reflow. */
    function paintAll (): void {
        const children = gridElement.value?.children;
        if (!children) return;

        for (let i = 0; i < cells.length; i++) {
            (children[i] as HTMLElement | undefined)?.classList.toggle('is-alive', cells[i] === 1);
        }
    }

    function countPopulation (): number {
        let alive = 0;
        for (let i = 0; i < cells.length; i++) alive += cells[i];
        return alive;
    }

    function seed (): void {
        for (let i = 0; i < cells.length; i++) {
            cells[i] = Math.random() < SEED_DENSITY ? 1 : 0;
        }
        generation.value = 0;
        population.value = countPopulation();
        quietGenerations = 0;
    }

    /** Throws the board away and starts again from a fresh random seed. */
    function reseed (): void {
        seed();
        paintAll();
    }

    /** The four orientations of a glider, one per diagonal it can travel along. */
    const GLIDERS = [
        [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
        [[0, 1, 0], [1, 0, 0], [1, 1, 1]],
        [[1, 1, 1], [0, 0, 1], [0, 1, 0]],
        [[1, 1, 1], [1, 0, 0], [0, 1, 0]]
    ];

    /**
     * The 3x3 block of indices starting at `origin`, or null if it would run off an edge.
     *
     * Walked out with the library's own relative-position calls rather than index arithmetic, for the same
     * reason the neighbour table is: it stays correct across a reflow without knowing the column count.
     */
    function blockAt (origin: number): number[][] | null {
        const instance = grid.value;
        if (!instance) return null;

        const down = (i: number) => (i < 0 || instance.isBottomRow(i) ? -1 : instance.getGridItemBelow(i));
        const right = (i: number) => (i < 0 || instance.isRightColumn(i) ? -1 : instance.getGridItemToTheRight(i));

        const block: number[][] = [];
        let start = origin;

        for (let r = 0; r < 3; r++) {
            if (start < 0 || start >= cells.length) return null;

            const middle = right(start);
            const end = right(middle);
            if (middle < 0 || end < 0) return null;

            block.push([start, middle, end]);
            start = down(start);
        }

        return block;
    }

    /**
     * Drops a couple of gliders onto the board.
     *
     * Life settles into still lifes — blocks, beehives, loaves — which are stable by the rules and simply sit
     * there until something disturbs them. Gliders are the something: they travel, collide with whatever has
     * gone quiet, and start it moving again, rather than blanking the board with a fresh seed.
     */
    function injectGliders (): void {
        for (let attempt = 0, placed = 0; attempt < 60 && placed < 2; attempt++) {
            const block = blockAt(Math.floor(Math.random() * cells.length));
            if (!block) continue;

            const shape = GLIDERS[Math.floor(Math.random() * GLIDERS.length)];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) cells[block[r][c]] = shape[r][c];
            }

            placed++;
        }
    }

    /** How many cells changed state in the generation just computed. */
    function churn (): number {
        let changes = 0;
        for (let i = 0; i < cells.length; i++) if (cells[i] !== previous[i]) changes++;
        return changes;
    }

    function tick (): void {
        if (!onScreen || document.hidden) return;

        previous.set(cells);

        for (let i = 0; i < cells.length; i++) {
            let alive = 0;
            const around = neighbours[i];

            for (let n = 0; n < around.length; n++) alive += previous[around[n]];

            // B3/S23: a cell is born on exactly three live neighbours and survives on two or three.
            cells[i] = previous[i] === 1 ? (alive === 2 || alive === 3 ? 1 : 0) : (alive === 3 ? 1 : 0);
        }

        generation.value++;
        population.value = countPopulation();

        /*
         * Measuring how much moved, rather than whether anything moved at all. A board of still lifes with one
         * oscillator left in it is never identical generation to generation, so a stricter test never fires and
         * the board looks frozen even though the rules are being followed exactly.
         */
        quietGenerations = churn() < cells.length * 0.04 ? quietGenerations + 1 : 0;

        if (sustain) {
            if (population.value < cells.length * 0.04 || generation.value > 600) {
                seed();
            } else if (quietGenerations >= 4) {
                injectGliders();
                quietGenerations = 0;
            }
        }

        // Seeding and gliders both write straight into `cells`, so this one diff covers them too.
        paintChanges();
    }

    /**
     * Fills the container with exactly as many cells as it takes to cover it, in whole rows.
     *
     * This is the only measuring done by hand, and only because the library cannot count children that do not
     * exist yet. Once they do, it takes over: the column count, and everything built on it, comes from there.
     */
    function resize (): void {
        if (!container.value) return;

        const rect = container.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const nextColumns = Math.max(1, Math.floor(rect.width / CELL));
        const nextRows = Math.max(1, Math.ceil(rect.height / CELL));
        const total = nextColumns * nextRows;

        // A resize that does not change how many cells fit leaves the board alone.
        if (total === cells.length && nextColumns === columnCount.value) return;

        cellCount.value = total;
        cells = new Uint8Array(total);
        previous = new Uint8Array(total);
        seed();

        // Let Vue render the cells before the library measures them.
        requestAnimationFrame(() => {
            if (!gridElement.value) return;

            grid.value?.destroy();
            grid.value = new SelfAwareGrid(gridElement.value, CELL, false);
            grid.value.beginObservingResize();

            columnCount.value = grid.value.columnCount();
            rowCount.value = grid.value.rowCount();
            buildNeighbours();
            paintAll();
        });
    }

    onMounted(() => {
        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        resize();

        resizeObserver = new ResizeObserver(() => resize());
        if (container.value) resizeObserver.observe(container.value);

        // A background animation should not run while it is scrolled away or the tab is hidden.
        visibilityObserver = new IntersectionObserver((entries) => {
            onScreen = entries.some((entry) => entry.isIntersecting);
        });
        if (container.value) visibilityObserver.observe(container.value);

        if (!reducedMotion) timer = setInterval(tick, STEP_MS);
    });

    onBeforeUnmount(() => {
        clearInterval(timer);
        resizeObserver?.disconnect();
        visibilityObserver?.disconnect();
        grid.value?.destroy();
        grid.value = null;
    });

    return { cellCount, columnCount, rowCount, population, generation, reseed };
}
