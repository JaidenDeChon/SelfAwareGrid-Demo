// Conway's Game of Life, with SelfAwareGrid working out which cells touch which.
//
// Three elements make it up: a box for the board to fill, a grid of empty divs for SelfAwareGrid to
// measure, and a canvas that everything is drawn on. The divs are never painted — they exist so the
// library has a real, reflowing grid to answer questions about.
//
//     <div id="board">
//         <div id="layout"></div>
//         <canvas id="canvas"></canvas>
//     </div>
//     <button id="restart">Start over</button>
//
// Two things in the stylesheet matter. The cells have to be the size this file expects, and the gaps
// between them have to be written down: a grid that never states its gap leaves the library with
// nothing to measure, and it cannot work out where anything is.
//
//     #board        { position: relative; overflow: hidden }
//     #layout       { position: absolute; inset: 0; visibility: hidden;
//                     display: grid; grid-template-columns: repeat(auto-fill, 18px);
//                     column-gap: 0; row-gap: 0 }
//     #layout > div { width: 18px; height: 18px }
//     #canvas       { position: absolute; inset: 0 }

import SelfAwareGrid from 'self-aware-grid';

const CELL = 18;          // the width and height of one cell, in pixels
const STEP_MS = 320;      // how long each generation is shown for
const FADE_MS = 200;      // how long a cell takes to appear or disappear
const START_ALIVE = 0.28; // how much of a fresh board begins alive

const board = document.querySelector('#board');
const layout = document.querySelector('#layout');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

let grid;           // the SelfAwareGrid reading the layout back to us
let touching = [];  // for each cell, the cells around it
let alive = new Uint8Array(0);     // 1 for a living cell, 0 for a dead one
let wasAlive = new Uint8Array(0);  // the same, one generation ago
let shown = new Float32Array(0);   // how visible each cell is on screen, from 0 to 1
let columns = 0;
let fadeFrame = 0;
let settled = 0;    // generations that have gone by with barely anything moving

/*
 * Work out how many cells fit in the box, and put that many empty divs in it.
 *
 * This is the one place that measures anything itself, and only because the library cannot count cells
 * that do not exist yet. Once they do exist, it takes over.
 */
function build () {
    const { width, height } = board.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;

    const across = Math.max(1, Math.floor(width / CELL));
    const down = Math.max(1, Math.ceil(height / CELL));
    const total = across * down;

    // A resize that does not change how many cells fit leaves the board alone.
    if (total === alive.length && across === columns) {
        draw();
        return;
    }

    layout.replaceChildren(...Array.from({ length: total }, () => document.createElement('div')));

    alive = new Uint8Array(total);
    wasAlive = new Uint8Array(total);
    shown = new Float32Array(total);

    grid?.destroy();
    grid = new SelfAwareGrid(layout, CELL);
    grid.beginObservingResize();

    columns = grid.columnCount();
    findNeighbours();
    seed();
}

/*
 * Ask SelfAwareGrid what is around each cell.
 *
 * Nothing here counts columns. It asks for the cell above, below, left and right, and reaches the four
 * corners by taking two of those steps in a row. The edge checks are what stop a cell on the left edge
 * from being handed a neighbour on the right edge, and `true` tells the library not to wrap either.
 *
 * Because these are questions rather than sums, the answers simply change when the grid reflows, and
 * calling this again is all it takes to be correct at the new width.
 */
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

/* Start over, with every cell decided by a coin toss. */
function seed () {
    for (let i = 0; i < alive.length; i++) alive[i] = Math.random() < START_ALIVE ? 1 : 0;
    settled = 0;
    fade();
}

/*
 * One generation, by the four rules:
 *
 *   a living cell with two or three living neighbours lives on;
 *   with fewer than two, it dies;
 *   with more than three, it dies;
 *   a dead cell with exactly three living neighbours comes to life.
 */
function step () {
    wasAlive.set(alive);

    for (let i = 0; i < alive.length; i++) {
        let around = 0;
        for (const neighbour of touching[i]) around += wasAlive[neighbour];

        alive[i] = wasAlive[i] ? (around === 2 || around === 3 ? 1 : 0) : (around === 3 ? 1 : 0);
    }

    fade();
}

/* Move every cell towards where it now is, over FADE_MS, so births and deaths do not pop. */
function fade () {
    cancelAnimationFrame(fadeFrame);

    const from = Float32Array.from(shown);
    const start = performance.now();

    const nextFrame = (time) => {
        const progress = Math.min((time - start) / FADE_MS, 1);
        const softened = 1 - (1 - progress) * (1 - progress);

        for (let i = 0; i < shown.length; i++) {
            shown[i] = from[i] + (alive[i] - from[i]) * softened;
        }

        draw();
        if (progress < 1) fadeFrame = requestAnimationFrame(nextFrame);
    };

    fadeFrame = requestAnimationFrame(nextFrame);
}

/* Paint the board. A cell's place on the canvas is its position in the grid, times the cell size. */
function draw () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#007BFF';

    for (let i = 0; i < shown.length; i++) {
        if (shown[i] < 0.01) continue;

        context.globalAlpha = shown[i] * 0.85;
        context.fillRect((i % columns) * CELL, Math.floor(i / columns) * CELL, CELL, CELL);
    }

    context.globalAlpha = 1;
}

/* The four directions a glider can be pointed in. */
const GLIDERS = [
    [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
    [[0, 1, 0], [1, 0, 0], [1, 1, 1]],
    [[1, 1, 1], [0, 0, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0], [0, 1, 0]]
];

/*
 * The three-by-three block of cells starting at `corner`, or nothing if it would run off an edge.
 *
 * Walked out by asking the library for the cell to the right and the cell below, for the same reason the
 * neighbours are: it stays right at any width, without being told one.
 */
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
 * Drop a couple of gliders onto the board.
 *
 * Boards tend to settle down: what is left of them holds still and stays that way, which is correct by the
 * rules but dull to watch. A glider is a small shape that travels on its own, so a pair of them gives the
 * settled parts something to run into — better than wiping the board and starting again.
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
 * Run it.
 *
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
    } else if (settled >= 4) {
        addGliders();
        settled = 0;
    }
}, STEP_MS);

// The button under the board.
document.querySelector('#restart').addEventListener('click', seed);

// Build it now, and again whenever the box changes size and the grid reflows underneath.
new ResizeObserver(build).observe(board);
