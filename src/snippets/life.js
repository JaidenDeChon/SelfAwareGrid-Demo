import SelfAwareGrid from 'self-aware-grid';

const CELL = 18;          // the width and height of one cell, in pixels
const STEP_MS = 320;      // how long each generation is shown for
const START_ALIVE = 0.28; // how much of a fresh board begins alive

const board = document.querySelector('#board');
const cells = document.querySelector('#cells');

let grid;                          // the SelfAwareGrid reading the layout back to us
let touching = [];                 // for each cell, the cells around it
let alive = new Uint8Array(0);     // 1 for a living cell, 0 for a dead one
let wasAlive = new Uint8Array(0);  // the same, one generation ago
let settled = 0;                   // generations that have gone by with barely anything moving

/* Work out how many cells fit in the box, and put that many empty divs in it. */
function build () {
    const { width, height } = board.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const across = Math.max(1, Math.floor(width / CELL));
    const down = Math.max(1, Math.ceil(height / CELL));
    const total = across * down;

    if (total === alive.length) return;

    cells.replaceChildren(...Array.from({ length: total }, () => document.createElement('div')));

    alive = new Uint8Array(total);
    wasAlive = new Uint8Array(total);

    grid?.destroy();
    grid = new SelfAwareGrid(cells, CELL);
    grid.beginObservingResize();

    findNeighbours();
    seed();
}

/* Determine what is around each cell. */
function findNeighbours () {
    const total = alive.length;
    const onBoard = (cell) => cell >= 0 && cell < total;

    const above = (cell) => (grid.isTopRow(cell) ? -1 : grid.getGridItemAbove(cell));
    const below = (cell) => (grid.isBottomRow(cell) ? -1 : grid.getGridItemBelow(cell));
    const left = (cell) => (grid.isLeftColumn(cell) ? -1 : grid.getGridItemToTheLeft(cell, true));
    const right = (cell) => (grid.isRightColumn(cell) ? -1 : grid.getGridItemToTheRight(cell));
    const andThen = (cell, step) => (onBoard(cell) ? step(cell) : -1);

    touching = Array.from({ length: total }, (_, cell) => {
        const up = above(cell);
        const down = below(cell);

        return [
            up,
            down,
            left(cell),
            right(cell),
            andThen(up, left),
            andThen(up, right),
            andThen(down, left),
            andThen(down, right)
        ].filter(onBoard);
    });
}

/* Start over, with every cell decided at random. */
function seed () {
    for (let i = 0; i < alive.length; i++) alive[i] = Math.random() < START_ALIVE ? 1 : 0;
    settled = 0;
    showAll();
}

/*
 * Compute what happens to this cell next based on its surroundings:
 *
 * - a living cell with two or three living neighbours lives on;
 * - with fewer than two, it dies;
 * - with more than three, it dies;
 * - a dead cell with exactly three living neighbours comes to life.
 */
function step () {
    wasAlive.set(alive);

    for (let i = 0; i < alive.length; i++) {
        let around = 0;
        for (const neighbour of touching[i]) around += wasAlive[neighbour];

        alive[i] = wasAlive[i] ? (around === 2 || around === 3 ? 1 : 0) : (around === 3 ? 1 : 0);
    }
}

/* Render the newest changes to the board. */
function showChanges () {
    for (let i = 0; i < alive.length; i++) {
        if (alive[i] !== wasAlive[i]) cells.children[i].classList.toggle('alive', alive[i] === 1);
    }
}

/* The same, for when there is nothing to compare against: a fresh seed, or a board just rebuilt. */
function showAll () {
    for (let i = 0; i < alive.length; i++) cells.children[i].classList.toggle('alive', alive[i] === 1);
}

/* The four orientations a glider can take. */
const GLIDERS = [
    [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
    [[0, 1, 0], [1, 0, 0], [1, 1, 1]],
    [[1, 1, 1], [0, 0, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0], [0, 1, 0]]
];

/* The three-by-three block of cells starting at `corner`. */
function blockAt (corner) {
    const right = (cell) => (cell < 0 || grid.isRightColumn(cell) ? -1 : grid.getGridItemToTheRight(cell));
    const below = (cell) => (cell < 0 || grid.isBottomRow(cell) ? -1 : grid.getGridItemBelow(cell));

    const block = [];
    let start = corner;

    for (let row = 0; row < 3; row++) {
        if (start < 0 || start >= alive.length) return null;

        const middle = right(start);
        const end = right(middle);
        if (middle < 0 || end < 0) return null;

        block.push([start, middle, end]);
        start = below(start);
    }

    return block;
}

/*
 * Drop a couple of gliders onto the board. Conway's Game of Life tends to settle down eventually so we're
 * dropping in some gliders to mix things up and keep things moving for the sake of the demo.
 */
function addGliders () {
    for (let tries = 0, added = 0; tries < 60 && added < 2; tries++) {
        const block = blockAt(Math.floor(Math.random() * alive.length));
        if (!block) continue;

        const shape = GLIDERS[Math.floor(Math.random() * GLIDERS.length)];
        for (let row = 0; row < 3; row++) {
            for (let column = 0; column < 3; column++) alive[block[row][column]] = shape[row][column];
        }

        added++;
    }
}

/*
 * Run the simulation.
 * If the board has nearly emptied out, start again. If hardly anything has moved for a few generations,
 * send in the gliders instead.
 */
setInterval(() => {
    step();

    let living = 0;
    let moved = 0;

    for (let i = 0; i < alive.length; i++) {
        living += alive[i];
        if (alive[i] !== wasAlive[i]) moved++;
    }

    settled = moved < alive.length * 0.04 ? settled + 1 : 0;

    if (living < alive.length * 0.04) {
        seed();
    } else {
        if (settled >= 4) {
            addGliders();
            settled = 0;
        }
        showChanges();
    }
}, STEP_MS);

document.querySelector('#restart').addEventListener('click', seed);
new ResizeObserver(build).observe(board);
