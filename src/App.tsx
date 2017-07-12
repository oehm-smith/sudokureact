import * as React from 'react';
// import React, {Component} from 'react';
import * as _ from 'lodash';
import './App.css';

const logo = require('./logo.svg');

/**
 * Sudoku - the game typically on a 9x9 board that is broken down into 9 rows, 9 cols and 9 cells of 9 entries.  And
 * the possible values are 1..9.
 *
 * Invariant:  That no row, col or cell has more than one of any value
 *
 * Glossary:
 * - Column - across (L to R) the board (table) - there are Board.rccSize of them (eg. 9) - numbered left to right
 * - Row - down (Top to Bottom) the board (table) - there are Board.rccSize of them (eg. 9) - numbered top to bottom
 * - Cell - squares in the board containing Board.rccSize entries - there are Board.rccSize of them (eg. 9) - numbered
 * L to R, Top to Bottom
 * - Entries - the unit squares that can contain a value - there are Board.rccSize of them
 * Entries are at Points on the Board / table / matrix - [col,row]
 * - Value - the contents of each Entry ie 1..9
 */
export class Point {
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

export enum RCCType {'row', 'col', 'cell'}
;

/**
 * RCC - Row Column Cell - the representation of the Sudoku board.
 *
 * All board indexes are 1 based.  And converted to 0 based for the Arrays
 */
export class RCC {
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
        let isIn: boolean = (row >= this._topLeft[0] && row <= this._bottomRight[0]
        && col >= this._topLeft[1] && col <= this._bottomRight[1]);

        let tl: string = JSON.stringify(this._topLeft);
        let br: string = JSON.stringify(this._bottomRight);
        console.log(`RCC isIn - row: ${row}, col: ${col}, TL: ${tl}, BR: ${br}- ${isIn}`);
        return isIn;
    }

    /**
     * Return the values used in this row.  But never 0, which is a 'blank'
     */
    public usedValues(): number[] {
        // let tl: string = JSON.stringify(this._topLeft);
        // let br: string = JSON.stringify(this._bottomRight);

        // console.log(`usedValues - topLeft: ${tl}, bottomRight: ${br}`)
        let usedValues: number[] = new Array();
        for (let row: number = this._topLeft.y - 1; row < this._bottomRight.y; row++) {
            for (let col: number = this._topLeft.x - 1; col < this._bottomRight.x; col++) {
                // TODO - 9!
                let index = row * 9 + col;
                // console.log(`  board at: ${index} - ${this.board[index]}`);
                if (this.board[index] !== 0) {
                    usedValues.push(this.board[index]);
                }
            }
        }
        // console.log(`  ${usedValues}`);
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

class Rows {
    [rows: number]: RCC; // Save the RCCs by row
}
class Cols {
    [cols: number]: RCC; // Save the RCCs by col
}
class Cells {
    [cells: number]: RCC; // Save the RCCs by cell
}

export class Board {
    private _board: number[] = new Array();
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
        return this.cols[entry.x];
    }

    public getCell(entry: Point): RCC {
        let cellNum: number = this.determineCell(entry);
        return this.cells[cellNum];
    }

    /**
     * Return the possible values that could be inserted at the given entry on the grid to keep the
     * Sudoku invariant true.
     *
     * @param entry
     */
    public getPossibleValues(entry: Point): number[] {
        let rccRow: RCC = this.getRow(entry);
        let rccCol: RCC = this.getCol(entry);
        let rccCell: RCC = this.getCell(entry);//
        console.log(`getPossibleValues @ ${entry.getDebug()}`);
        console.log(`  getPossibleValues UsedValues - row: [${rccRow.usedValues()}], col: [${rccCol.usedValues()}], `
            + `cell: [${rccCell.usedValues()}]`);
        let rccIntersection: number[] = this.getRCCUnion(rccRow, rccCol, rccCell);
        let rccDifference: number[] = this.getRCCDifference(rccIntersection);
        console.log(`  getPossibleValues(${entry.getDebug()} - [${rccDifference}]`)
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
    public indexToPoint(index:number): Point {
        let x: number = (index) % this.rccSize + 1;
        let y: number = Math.floor(index / this.rccSize)+1;

        return new Point(x,y);
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

    /**
     *
     * @param row
     * @param col
     * @param cell
     * @returns {[number]} that is the intersection of the values in the entries at the row, col and cell
     */
    getRCCIntersection(row: RCC, col: RCC, cell: RCC): number[] {
        let rowEntries: number[] = row.usedValues();
        let colEntries: number[] = col.usedValues();
        let cellEntries: number[] = cell.usedValues();

        let intersection: number[] = _.intersection(rowEntries, colEntries, cellEntries);

        console.log(`  getRCCIntersection row: ${row.getRCCDebug()}, col: ${col.getRCCDebug()}, `
            + `cell: ${this.determineCell(row.topLeft)} - [${intersection}]`);
        return intersection;
    }

    private getRCCUnion(row: RCC, col: RCC, cell: RCC): number[] {
        let rowEntries: number[] = row.usedValues();
        let colEntries: number[] = col.usedValues();
        let cellEntries: number[] = cell.usedValues();

        let union: number[] = _.union(rowEntries, colEntries, cellEntries);

        console.log(`  getRCCUnion row: ${row.getRCCDebug()}, col: ${col.getRCCDebug()}, `
            + `cell: ${this.determineCell(row.topLeft)} - [${union}]`);
        return union;
    }

    /**
     *
     * @param allRCCValues
     * @returns {[number]} the difference between a full set of possible values eg. [1..9] and allRCCValues
     */
    private getRCCDifference(allRCCValues: number[]): number[] {
        // TODO - make this generic
        let allPossible: number[] = _.range(1, 10);
        return _.difference(allPossible, allRCCValues);
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
        // temp get all items
        // out+='#############\n';
        // for (let i=0; i < this.boardSize; i++) {
        //     out+=`index: ${i} -> ${this.board[i]}\n`;
        // }
        return out;
    }

    /* ********** Private Methods ********** */

    private buildRCC() {
        this.boardRCC = new Array();
        // console.log('columns');
        for (let col: number = 1; col <= this.rccSize; col++) {
            let rcc: RCC = new RCC(this.board, new Point(col, 1), new Point(col, this.rccSize));
            this.boardRCC.push(rcc);
            this.setCol(col, rcc);
        }
        // console.log('rows');
        for (let row: number = 1; row <= this.rccSize; row++) {
            let rcc: RCC = new RCC(this.board, new Point(1, row), new Point(this.rccSize, row));
            this.boardRCC.push(rcc);
            this.setRow(row, rcc);
        }
        // console.log('cells');
        for (let cell: number = 1; cell <= this.rccSize; cell++) {
            let cellCol: number = (cell - 1) % 3 + 1; // 3 of these
            let cellRow: number = Math.floor((cell - 1) / 3 + 1); // 3 of these
            let colStart: number = ((cellCol - 1) * 3) + 1; // 9 of these
            let rowStart: number = ((cellRow - 1) * 3) + 1; // 9 of these
            let rcc: RCC = new RCC(this.board, new Point(colStart, rowStart),
                new Point(colStart + 2, rowStart + 2));
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

    public get board(): number[] {
        return this._board;
    }
}

class Sudoku extends React.Component {
    private rccSize: number = 9;  // Size of each row, cell and columns
    // private board: Board;     // Board of the numbers in each place - top-left to bottom-right
    // private full: number[] = _.range(1,10);
    private handleChange: Function = (event: any) => {
    };

    constructor(props: {}) {
        super(props);
        this.assertDimensions();
        this.state = {board: this.buildBoard()};
        this.handleChange = this.handleValueChange.bind(this);
    }

    assertDimensions() {
        if (this.rccSize % 3 !== 0) {
            let msg: string = `Board row/height value must be divisible by 3 - it is: ${this.rccSize}`;
            throw new Error(msg);
        }
    }

    buildBoard(): Board {
        return new Board(this.rccSize, this.exampleBoard1());
    }

    // Numbers on the board - it should be 40% filled
    randomNumberBoard01(): number[] {
        let board: number[] = new Array<number>(81);
        for (let pos: number = 1; pos <= (9 * 9); pos++) {
            let wantValueNumber: number = Math.floor(Math.random() * 5);
            // console.log('add entry to board at pos: '+pos);
            if (wantValueNumber <= 1) {
                board.push(Math.floor(Math.random() * 9 + 1));
            } else {
                board.push(0);
            }
        }
        return board;
    }

    exampleBoard1(): number[] {
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

    /* ********************************************************** */
    /* Render methods */
    /* ********************************************************** */

    handleValueChange(event: any) {
        console.log('handle change: ', event);
    }

    makeOption = function (item: number) {
        return <option>{''+item}</option>;
    };

    getCells(row: number) {
        let indexInRowStart: number = (row - 1) * 9 + 1;
        let indexInRowEnd: number = indexInRowStart + 8;
        // console.log('getCells - indexInRowStart: ' + indexInRowStart + ', indexInRowEnd: ' + indexInRowEnd);
        // console.log('board length: ', this.board.length);
        return this.state['board'].board.map((item: number, index: number) => {
            // index+1 since index is 0-based
            // console.log('borad map - value: ', item);
            if (index + 1 >= indexInRowStart && index + 1 <= indexInRowEnd) {
                let val = item > 0 ? item : '';
                // console.log(`  value: ${item}, val: ${val}, output index: ${index}`);
                let tdFooter = index > 8 && Math.floor((index) / 9) % 3 === 0 ? 'floor' : '';
                let tdWall = (index + 1) % 3 === 0 ? 'wall' : '';

                let classes = '';

                if (tdFooter.length > 0) {
                    classes += 'cellFooter ';
                }
                if (tdWall.length > 0) {
                    classes += 'cellWall';
                }
                // this.state['board'].board[index]
                // this.state['board'].getPossibleValuesByIndex(index)
                console.log(`selected: ${this.state['board'].board[index]}`);
                return (<td key={index} className={classes}>
                    <select value={this.state['board'].board[index]} onChange={this.handleValueChange}>
                        <option>{val} </option>
                        {this.state['board'].getPossibleValuesByIndex(index).map(this.makeOption)}
                    </select></td>);
                // selected
            } else {
                return '';
            }
        });
    }

    getRow(row: number): any {
        const data: any = <tr key={row}>{this.getCells(row)}</tr>;
        return data;
    }

    getRows(): any {
        const rows = _.range(1, 10).map((row: number) => {
            return this.getRow(row);
        });
        return <tbody>{rows}</tbody>;
    }

    render() {
        return (
            <div>
                <form>
                    <table>
                        {this.getRows()}
                    </table>
                </form>
            </div>
        );
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }
}

class App extends React.Component
    <{}
        , {}> {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>Welcome to Sudoku</h2>
                </div>
                <div>
                    <div><Sudoku/></div>
                </div>
            </div>
        );
    }
}

export default App;
