/**
 * Phones get noticeably fewer cells than desktops. At four columns a full-size demo grid runs to eight or
 * more rows, which pushes the controls below it off the screen; trimming ~40% keeps the whole demo — grid,
 * slider and buttons — visible at once.
 */
export function initialCellCount (wide: number): number {
    const narrow = window.matchMedia('(max-width: 639px)').matches;

    // Rounded to an even number so the grid still fills its rows tidily at common column counts.
    return narrow ? Math.round((wide * 0.6) / 2) * 2 : wide;
}
