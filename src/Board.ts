import { RCC } from './RCC';
import { Point } from './Point';
import * as _ from 'lodash';

class Rows {
    [rows: number]: RCC; // Save the RCCs by row
}
class Cols {
    [cols: number]: RCC; // Save the RCCs by col
}
class Cells {
    [cells: number]: RCC; // Save the RCCs by cell
}

export default class Board {
    private _board: number[] = [];
    private rccSize: number;        // Number of rows, cols and cells in a square
    private boardSize: number;      // Total number of entries on the board ie. rccSize squared
    private boardRCC: Array<RCC>;   // Array of all the rows, cells and columns
    private rows: Rows = new Rows();             // Save the RCCs by row
    private cols: Cols = new Cols();             // Save the RCCs by col
    private cells: Cells = new Cells();          // Save the RCCs by cell

    constructor(rccSize: number, boardItems: number[]) {
        this.rccSize = rccSize;
        this.boardSize = rccSize * rccSize;
        this._board = new Array<number>();
        this.load(boardItems);
        this.buildRCC();
    }

    public getRow(entry: Point): RCC {
        return this.rows[entry.y];
    }

    public getCol(entry: Point): RCC {
        let col: RCC = this.cols[entry.x];
        return col;
    }

    public getCell(entry: Point): RCC {
        let cellNum: number = this.determineCell(entry);
        return this.cells[cellNum];
    }

    public get board(): number[] {
        return this._board;
    }

    public push(item: number) {
        if (this._board.length <= this.boardSize) {
            this._board.push(item);
        } else {
            throw new Error('board - attempting to push more than boardSize: ' + this.boardSize
                + ' onto the board array: ' + JSON.stringify(this._board));
        }
    }

    public load(items: number[]) {
        items.forEach((item) => this.push(item));
        console.log(`Board / load - size: ${this.boardSize} - board: ${this.getBoardDebug()}`);
    }

    public getBoardDebug(): string {
        // let rccSize = Math.sqrt(this.boardSize);
        let singleSize = Math.sqrt(this.rccSize);   // height and width of each cell
        let out: string = '\n------------\n';
        for (let i = 0; i < this.rccSize; i++) {
            out += '|';
            for (let j = 0; j < this.rccSize; j++) {
                let index = i * this.rccSize + j;
                out += this._board[index];
                if ((j + 1) % singleSize === 0) {
                    out += '|';
                }
            }
            out += '\n';
            if ((i + 1) % singleSize === 0) {
                out += '------------\n';
            }
        }
        return out;
    }

    /**
     * Return the possible values that could be inserted at the given entry on the grid to keep the
     * Sudoku invariant true.
     *
     * @param entry
     */
    public getPossibleValues(entry: Point): number[] {
        console.log(`getPossibleValues @ ${entry.getDebug()}`);
        let rccRow: RCC = this.getRow(entry);
        let rccCol: RCC = this.getCol(entry);
        let rccCell: RCC = this.getCell(entry);
        console.log(`  getPossibleValues UsedValues in row: [${rccRow.usedValues()}], col: [${rccCol.usedValues()}], `
            + `cell: [${rccCell.usedValues()}]`);
        let rccUnion: number[] = this.getRCCUnion(rccRow, rccCol, rccCell);

        let rccDifference: number[] = this.getRCCDifference(rccUnion);
        console.log(`  getPossibleValues(${entry.getDebug()} - [${rccDifference}]`);
        return rccDifference;
    }

    /**
     * Given an array (zero-based) index, return an array of the possible values for that
     *
     * @param index
     * @returns {[number]}
     */
    public getPossibleValuesByIndex(index: number): number[] {
        let entry: Point = this.indexToPoint(index);
        let ret: number[] = this.getPossibleValues(entry);
        console.log(`getPossibleValuesByIndex(${index}) -> entry: ${entry.getDebug()} -> ${ret}`);
        return ret;
    }

    /**
     * Given a zero-indexed value as used in arrays, return as a 1-th indexed Point (x,y).
     *
     * @param index
     * @returns {Point}
     */
    public indexToPoint(index: number): Point {
        let x: number = (index) % this.rccSize + 1;
        let y: number = Math.floor(index / this.rccSize) + 1;

        return new Point(x, y);
    }

    /**
     *
     * @param row
     * @param col
     * @param cell
     * @returns {[number]} that is the intersection of the values in the entries at the row, col and cell
     */
    public getRCCIntersection(row: RCC, col: RCC, cell: RCC): number[] {
        let rowEntries: number[] = row.usedValues();
        let colEntries: number[] = col.usedValues();
        let cellEntries: number[] = cell.usedValues();

        let intersection: number[] = _.intersection(rowEntries, colEntries, cellEntries);

        console.log(`  getRCCIntersection row: ${row.getRCCDebug()}, col: ${col.getRCCDebug()}, `
            + `cell: ${this.determineCell(row.topLeft)} - [${intersection}]`);
        return intersection;
    }

    /**
     * Given an entry position point on the board, return the cell this lies in.
     *
     * @param entry
     */
    private determineCell(entry: Point): number {
        let cellsPerRow: number = Math.sqrt(this.rccSize);
        let cellCol: number = Math.ceil((((entry.x - 1) % this.rccSize) + 1) / cellsPerRow);
        let cellRow: number = Math.ceil((((entry.y - 1) % this.rccSize) + 1) / cellsPerRow);
        let cellNum: number = (cellRow - 1) * cellsPerRow + cellCol;

        console.log(`  determineCell(${entry.getDebug()}} -> ${cellCol},${cellRow} = ${cellNum}`);

        return cellNum;
    }

    private getRCCUnion(row: RCC, col: RCC, cell: RCC): number[] {
        let rowEntries: number[] = row.usedValues();
        let colEntries: number[] = col.usedValues();
        let cellEntries: number[] = cell.usedValues();

        let union: number[] = _.union(rowEntries, colEntries, cellEntries).sort();

        console.log(`  getRCCUnion row: [${rowEntries}], col: [${colEntries}], `
            + `cell: [${cellEntries}] - [${union}]`);
        return union;
    }

    /**
     *
     * @param allRCCValues
     * @returns {[number]} the difference between a full set of possible values eg. [1..9] and allRCCValues
     */
    private getRCCDifference(allRCCValues: number[]): number[] {
        // TODO - make this generic - not 1..9 values range
        let allPossible: number[] = _.range(1, 10);
        let diff: number[] = _.difference(allPossible, allRCCValues);
        return diff;
    }

    /* ********** Private Methods ********** */

    private buildRCC() {
        this.boardRCC = new Array();
        for (let col: number = 1; col <= this.rccSize; col++) {
            let rcc: RCC = new RCC(this.board, new Point(col, 1), new Point(col, this.rccSize));
            this.boardRCC.push(rcc);
            this.setCol(col, rcc);
        }
        for (let row: number = 1; row <= this.rccSize; row++) {
            let rcc: RCC = new RCC(this.board, new Point(1, row), new Point(this.rccSize, row));
            this.boardRCC.push(rcc);
            this.setRow(row, rcc);
        }
        for (let cell: number = 1; cell <= this.rccSize; cell++) {
            let cellCol: number = (cell - 1) % 3 + 1; // 3 of these
            let cellRow: number = Math.floor((cell - 1) / 3 + 1); // 3 of these
            let colStart: number = ((cellCol - 1) * 3) + 1; // 9 of these
            let rowStart: number = ((cellRow - 1) * 3) + 1; // 9 of these
            let rcc: RCC = new RCC(this.board, new Point(colStart, rowStart), new Point(colStart + 2, rowStart + 2));
            this.boardRCC.push(rcc);
            this.setCell(cell, rcc);
        }
    }

    private setCol(col: number, rcc: RCC) {
        this.cols[col] = rcc;
    }

    private setRow(row: number, rcc: RCC) {
        this.rows[row] = rcc;
    }

    private setCell(cell: number, rcc: RCC) {
        this.cells[cell] = rcc;
    }
}
