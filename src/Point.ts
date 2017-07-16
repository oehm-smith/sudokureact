/**
 * A Point is a reference to a location on the Sudoku board.  It is 1-indexed rather than 0 (zero) for arrays.
 */
export default class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getDebug(): string {
        return `[${this.x},${this.y}]`;
    }
}
