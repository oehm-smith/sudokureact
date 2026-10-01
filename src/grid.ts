// ABOUTME: Presentation rules for the grid — cell boundaries and a square's option list.
// ABOUTME: Pure functions, kept out of Sudoku.tsx so that file exports only its component.

/**
 * Reject board sizes that can not be divided into square cells.
 *
 * @param rccSize number of entries in a row, column or cell
 * @throws Error if rccSize has no integer square root
 */
export function assertDimensions(rccSize: number) {
    if (!Number.isInteger(Math.sqrt(rccSize))) {
        throw new Error('Board row/height value must have a proper integer square root - row/height is: '
            + `${rccSize}`);
    }
}

/**
 * Classes marking the right and bottom edges of a three-by-three cell, so the CSS can draw
 * the heavier rules that make the cells readable.
 *
 * @param index zero-based board index
 * @param rccSize number of entries in a row, column or cell
 * @returns the space-separated class list, possibly empty
 */
export function buildClasses(index: number, rccSize: number): string {
    const cellsPerRow: number = Math.sqrt(rccSize);
    const classes: string[] = [];

    if (Math.ceil((index + 1) / rccSize) % cellsPerRow === 0) {
        classes.push('cellFooter');
    }
    if ((index + 1) % cellsPerRow === 0) {
        classes.push('cellWall');
    }

    return classes.join(' ');
}

/**
 * The values a square offers in its dropdown: a leading 0 for 'blank', the values that keep
 * the Sudoku invariant true, and the square's own current value.
 *
 * The current value is included because it is counted among its own row's used values, so the
 * hint calculation excludes it - but a select whose value is absent from its options renders
 * blank.
 *
 * @param value the square's current value, 0 for blank
 * @param possibleValues values that may legally be placed in the square
 * @returns the option values, ascending, starting with 0
 */
export function optionValuesFor(value: number, possibleValues: number[]): number[] {
    const values = value > 0 ? [...new Set([...possibleValues, value])] : [...possibleValues];
    return [0, ...values.sort((a, b) => a - b)];
}
