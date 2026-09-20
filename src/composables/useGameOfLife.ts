import { onBeforeUnmount, onMounted, ref, shallowRef, type Ref } from 'vue';
import SelfAwareGrid from 'self-aware-grid';

/** The elements the simulation needs: a box to fill, a grid to measure, and a canvas to draw on. */
export interface GameOfLifeElements {
    container: Ref<HTMLElement | null>;
    gridElement: Ref<HTMLElement | null>;
    canvasElement: Ref<HTMLCanvasElement | null>;
}

export interface GameOfLifeOptions {
    /** Size of one cell, in CSS pixels. The smaller it is, the more room the organisms have. */
    cell?: number;
    /** Milliseconds between generations. */
    stepMs?: number;
    /** How long a birth or a death takes to fade in or out. */
    fadeMs?: number;
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
 * The hero backdrop and the Game of Life demo section are the same simulation at different sizes, so all of
 * it — the neighbour table, the canvas renderer, the fade, the observers — lives here, and the components
 * that use it only decide how big the cells are and what the board looks like.
 */
export function useGameOfLife (elements: GameOfLifeElements, options: GameOfLifeOptions = {}) {

    const {
        cell: CELL = 56,
        stepMs: STEP_MS = 700,
        fadeMs: FADE_MS = 260,
        seedDensity: SEED_DENSITY = 0.3,
        sustain = true
    } = options;

    const { container, gridElement, canvasElement } = elements;

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
    /** Per-cell render alpha, eased towards `cells` so births and deaths fade rather than pop. */
    let alpha: Float32Array = new Float32Array(0);
    /** Snapshot of `alpha` when the current fade began. */
    let from: Float32Array = new Float32Array(0);
    /** Indices whose alpha is actually moving during the current fade. */
    let changed: Int32Array = new Int32Array(0);
    let changedCount = 0;

    let columns = 0;
    let width = 0;
    let height = 0;

    let context: CanvasRenderingContext2D | null = null;
    let palette = { alive: '0 123 255', aliveAlpha: 0.26 };

    let timer: ReturnType<typeof setInterval> | undefined;
    let fadeFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let themeObserver: MutationObserver | null = null;
    let onVisibilityChange: (() => void) | null = null;

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
     * Reads the paint colour from the container rather than the document, so a board can override
     * `--life-alive-alpha` locally — the hero wants a faint backdrop, the demo wants solid cells.
     */
    function readPalette (): void {
        const style = getComputedStyle(container.value ?? document.documentElement);
        palette = {
            alive: style.getPropertyValue('--life-alive-rgb').trim() || palette.alive,
            aliveAlpha: Number(style.getPropertyValue('--life-alive-alpha')) || palette.aliveAlpha
        };
    }

    /**
     * Draws the whole simulation in one pass.
     *
     * This used to be one DOM node per cell with a CSS transition on each. `background-color` cannot be animated
     * on the compositor, so every frame repainted several hundred elements on the main thread — which both cost
     * ~10% of a frame budget and forced the hero's blurred glow to be re-rasterised in step with the simulation.
     * A single canvas is one paint of one element instead.
     */
    /** Paints one cell at its current alpha, clearing whatever was under it first. */
    function paintCell (i: number): void {
        if (!context) return;

        const x = (i % columns) * CELL;
        const y = Math.floor(i / columns) * CELL;

        context.clearRect(x, y, CELL, CELL);

        const a = alpha[i];
        if (a < 0.01) return;

        context.globalAlpha = a * palette.aliveAlpha;
        context.fillRect(x, y, CELL, CELL);
    }

    /** Full repaint. Only needed on a resize, a re-seed or a theme change. */
    function drawAll (): void {
        if (!context) return;

        context.clearRect(0, 0, width, height);

        // One fillStyle for the whole pass. Per-cell alpha goes through globalAlpha, which is a number
        // assignment — building an `rgb(... / a)` string per cell per frame meant several hundred colour
        // parses every frame, and that alone cost more than the simulation.
        context.fillStyle = `rgb(${palette.alive})`;

        for (let i = 0; i < alpha.length; i++) {
            const a = alpha[i];
            if (a < 0.01) continue;

            context.globalAlpha = a * palette.aliveAlpha;
            context.fillRect((i % columns) * CELL, Math.floor(i / columns) * CELL, CELL, CELL);
        }

        context.globalAlpha = 1;
    }

    /**
     * Repaints only the cells that are mid-fade.
     *
     * A canvas keeps what was drawn on it, and in a typical generation most cells do not change state — so
     * clearing and refilling the whole surface every frame was mostly redrawing pixels identical to the ones
     * already there, at device-pixel resolution.
     */
    function drawChanged (): void {
        if (!context) return;

        context.fillStyle = `rgb(${palette.alive})`;
        for (let n = 0; n < changedCount; n++) paintCell(changed[n]);
        context.globalAlpha = 1;
    }

    /**
     * Fades every cell from where it was to where it now is, over exactly FADE_MS, then stops.
     *
     * Interpolating from a snapshot rather than easing towards a moving target is what makes that bound real:
     * an exponential ease only approaches its target, so the loop outlived the step it belonged to and the
     * animation never actually stopped running.
     */
    function runFade (): void {
        cancelAnimationFrame(fadeFrame);
        from.set(alpha);

        changedCount = 0;
        for (let i = 0; i < alpha.length; i++) {
            if (Math.abs(cells[i] - alpha[i]) > 0.01) changed[changedCount++] = i;
        }

        if (changedCount === 0) return;

        if (reducedMotion) {
            for (let n = 0; n < changedCount; n++) alpha[changed[n]] = cells[changed[n]];
            drawChanged();
            return;
        }

        const start = performance.now();
        let painted = -Infinity;

        const stepFade = (now: number): void => {
            const t = Math.min((now - start) / FADE_MS, 1);

            // ~30fps is plenty for a background alpha fade, and halves the canvas uploads.
            if (t < 1 && now - painted < 32) {
                fadeFrame = requestAnimationFrame(stepFade);
                return;
            }

            painted = now;
            // ease-out, so the change lands softly.
            const eased = 1 - (1 - t) * (1 - t);

            for (let n = 0; n < changedCount; n++) {
                const i = changed[n];
                alpha[i] = from[i] + (cells[i] - from[i]) * eased;
            }

            drawChanged();
            if (t < 1) fadeFrame = requestAnimationFrame(stepFade);
        };

        fadeFrame = requestAnimationFrame(stepFade);
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
        runFade();
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

        runFade();
    }

    /**
     * Fills the container with exactly as many cells as it takes to cover it, in whole rows.
     *
     * The column count comes from SelfAwareGrid once the cells exist; this only works out how many DOM nodes to
     * create in the first place, which the library cannot know before they are there.
     */
    function resize (): void {
        if (!container.value || !canvasElement.value) return;

        const rect = container.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const nextColumns = Math.max(1, Math.floor(rect.width / CELL));
        const nextRows = Math.max(1, Math.ceil(rect.height / CELL));
        const total = nextColumns * nextRows;

        width = rect.width;
        height = rect.height;

        /*
         * Deliberately 1 device pixel per CSS pixel, not devicePixelRatio.
         *
         * Everything drawn here is an axis-aligned block on an integer boundary, so there is no detail for
         * a higher ratio to resolve — and the whole canvas surface is re-uploaded to the GPU on every draw
         * regardless of how small the dirty region is. At devicePixelRatio 2 that upload is four times the
         * pixels, under a mask and next to a 120px blur, which was enough to drop frames on its own.
         */
        const ratio = 1;
        canvasElement.value.width = Math.round(width * ratio);
        canvasElement.value.height = Math.round(height * ratio);
        canvasElement.value.style.width = `${width}px`;
        canvasElement.value.style.height = `${height}px`;

        context = canvasElement.value.getContext('2d');
        context?.setTransform(ratio, 0, 0, ratio, 0, 0);

        if (total === cells.length && nextColumns === columns) {
            drawAll();
            return;
        }

        columns = nextColumns;

        cellCount.value = total;
        cells = new Uint8Array(total);
        previous = new Uint8Array(total);
        alpha = new Float32Array(total);
        from = new Float32Array(total);
        changed = new Int32Array(total);
        seed();

        // Let Vue render the measuring grid before the library measures it.
        requestAnimationFrame(() => {
            if (!gridElement.value) return;

            grid.value?.destroy();
            grid.value = new SelfAwareGrid(gridElement.value, CELL, false);
            grid.value.beginObservingResize();

            columns = grid.value.columnCount();
            columnCount.value = columns;
            rowCount.value = grid.value.rowCount();
            buildNeighbours();

            for (let i = 0; i < alpha.length; i++) alpha[i] = cells[i];
            drawAll();
        });
    }

    onMounted(() => {
        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        readPalette();
        resize();

        resizeObserver = new ResizeObserver(() => resize());
        if (container.value) resizeObserver.observe(container.value);

        // A background animation should not run while it is scrolled away or the tab is hidden.
        visibilityObserver = new IntersectionObserver((entries) => {
            onScreen = entries.some((entry) => entry.isIntersecting);
        });
        if (container.value) visibilityObserver.observe(container.value);

        onVisibilityChange = () => { if (!document.hidden) drawAll(); };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // The theme toggle swaps the tokens the canvas paints with, so redraw when it does.
        themeObserver = new MutationObserver(() => { readPalette(); drawAll(); });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        if (!reducedMotion) timer = setInterval(tick, STEP_MS);
    });

    onBeforeUnmount(() => {
        clearInterval(timer);
        cancelAnimationFrame(fadeFrame);
        resizeObserver?.disconnect();
        visibilityObserver?.disconnect();
        themeObserver?.disconnect();
        if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange);
        grid.value?.destroy();
        grid.value = null;
    });

    return { cellCount, columnCount, rowCount, population, generation, reseed };
}
