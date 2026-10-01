// ABOUTME: Starting positions for the game.
// ABOUTME: A 0 marks a blank square; anything else is a given and can not be changed.

/**
 * The example starting board.
 *
 * TODO - customise (or multiple selections for) the initial board
 *
 * @returns the 81 starting values, row by row
 */
export function exampleBoard1(): number[] {
    return [0, 0, 0, 1, 0, 5, 0, 6, 8,
        0, 0, 0, 0, 0, 0, 7, 0, 1,
        9, 0, 1, 0, 0, 0, 0, 3, 0,
        0, 0, 7, 0, 2, 6, 0, 0, 0,
        5, 0, 0, 0, 0, 0, 0, 0, 3,
        0, 0, 0, 8, 7, 0, 4, 0, 0,
        0, 3, 0, 0, 0, 0, 8, 0, 5,
        1, 0, 5, 0, 0, 0, 0, 0, 0,
        7, 9, 0, 4, 0, 1, 0, 0, 0];
}
