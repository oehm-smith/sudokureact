// ABOUTME: RCC - a Row, Column or Cell: one contiguous region of the Sudoku board.
// ABOUTME: Holds a live reference to the board array so used values stay current as play proceeds.

import Point from './Point';
export enum RCCType {'row', 'col', 'cell'}

/**
 * RCC - Row Column Cell - the representation of the Sudoku board.
 *
 * All board indexes are 1 based.  And converted to 0 based for the Arrays
 */
export default class RCC {
    private board: Array<number>;
    private _topLeft: Point;
    private _bottomRight: Point;
    private rowWidth: number;   // Entries per board row, so an (x,y) can be turned into an array index

    constructor(board: number[], topLeft: Point, bottomRight: Point, rowWidth: number) {
        this.board = board;
        this._topLeft = topLeft;
        this._bottomRight = bottomRight;
        this.rowWidth = rowWidth;
    }

    public get topLeft(): Point {
        return this._topLeft;
    }

    public get bottomRight(): Point {
        return this._bottomRight;
    }

    /**
     * Return if the given row, col is part of this RCC.
     * @param row
     * @param col
     */
    isIn(row: number, col: number): boolean {
        return (row >= this._topLeft.y && row <= this._bottomRight.y
            && col >= this._topLeft.x && col <= this._bottomRight.x);
    }

    /**
     * Return the values used in this row.  But never 0, which is a 'blank'
     */
    public usedValues(): number[] {
        const usedValues: number[] = [];
        for (let row: number = this._topLeft.y - 1; row < this._bottomRight.y; row++) {
            for (let col: number = this._topLeft.x - 1; col < this._bottomRight.x; col++) {
                const index = row * this.rowWidth + col;
                const val: number = this.board[index];
                if (val !== 0) {
                    usedValues.push(val);
                }
            }
        }
        // Numeric comparator: the default sort is lexicographic, which misorders values above 9.
        return usedValues.sort((a, b) => a - b);
    }

    public getRCCDebug(printBoardAt: boolean = false): string {
        let out: string = `RCC - [${this._topLeft.x},${this._topLeft.y}] -> [${this._bottomRight.x},`
            + `${this._bottomRight.y}]`;
        if (printBoardAt) {
            out += `board:\n${this.board}`;
        }
        return out;
    }
}
