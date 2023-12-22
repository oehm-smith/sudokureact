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
    // values = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // Regardless of if a row, cell or col, this is an array and not a matrix

    constructor(board: number[], topLeft: Point, bottomRight: Point) {
        this.board = board;
        this._topLeft = topLeft;
        this._bottomRight = bottomRight;
        // console.log(`  RCC - topLeft: ${JSON.stringify(this.topLeft)},`
        //     + `bottomRight: ${JSON.stringify(this.bottomRight)}, board at that pos: TODO`);
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
        let isIn: boolean = (row >= this._topLeft.y && row <= this._bottomRight.y
        && col >= this._topLeft.x && col <= this._bottomRight.x);

        let tl: string = JSON.stringify(this._topLeft);
        let br: string = JSON.stringify(this._bottomRight);
        console.log(`RCC isIn - row: ${row}, col: ${col}, TL: ${tl}, BR: ${br}- ${isIn}`);
        return isIn;
    }

    /**
     * Return the values used in this row.  But never 0, which is a 'blank'
     */
    public usedValues(): number[] {
        let usedValues: number[] = new Array();
        for (let row: number = this._topLeft.y - 1; row < this._bottomRight.y; row++) {
            for (let col: number = this._topLeft.x - 1; col < this._bottomRight.x; col++) {
                // TODO - 9!
                let index = row * 9 + col;
                let val: number = this.board[index];
                if (val !== 0) {
                    usedValues.push(val);
                }
            }
        }
        usedValues = usedValues.sort();

        return usedValues;
    }

    /**
     * Return the unused values in this RCC
     *
     * @param row
     * @param col
     */
    public availableValues(row: number, col: number): Array<number | null> {
        return [null];
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
