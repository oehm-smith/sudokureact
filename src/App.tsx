import * as React from 'react';
// import React, {Component} from 'react';
import * as _ from 'lodash';
import './App.css';

const logo = require('./logo.svg');

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}


/**
 * RCC - Row Column Cell - the representation of the Sudoku board.
 *
 * All board indexes are 1 based.  And converted to 0 based for the Arrays
 */
class RCC {
    private board: Array<number>;
    private topLeft: Point;
    private bottomRight: Point;
    // values = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // Regardless of if a row, cell or col, this is an array and not a matrix

    constructor(board: number[], topLeft: Point, bottomRight: Point) {
        this.board = board;
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
        console.log(`  RCC - topLeft: ${JSON.stringify(this.topLeft)},`
            + `bottomRight: ${JSON.stringify(this.bottomRight)}, board at that pos: TODO`);
    }

    /**
     * Return if the given row, col is part of this RCC.
     * @param row
     * @param col
     */
    isIn(row: number, col: number): boolean {
        let isIn: boolean = (row >= this.topLeft[0] && row <= this.bottomRight[0]
        && col >= this.topLeft[1] && col <= this.bottomRight[1]);

        let tl: string = JSON.stringify(this.topLeft);
        let tr: string = JSON.stringify(this.bottomRight);
        console.log(`RCC isIn - row: ${row}, col: ${col}, TL: ${tl}, TR: ${tr}- ${isIn}`);
        return isIn;
    }

    /**
     * Return the unused values in this RCC
     *
     * @param row
     * @param col
     */
    availableValues(row: number, col: number): Array<number | null> {
        return [null];
    }
}

class Board {
    private _board: number[] = new Array();
    private rccSize: number;    // Number of rows, cols and cells in a square
    private boardSize: number;
    private boardRCC: Array<RCC>;  // Array of all the rows, cells and columns

    constructor(rccSize: number, boardItems: number[]) {
        this.rccSize = rccSize;
        this.boardSize = rccSize * rccSize;
        this._board = new Array<number>();
        this.load(boardItems);
        this.buildRCC();
    }

    private buildRCC() {
        this.boardRCC = new Array();
        console.log('columns');
        for (let col: number = 1; col <= this.rccSize; col++) {
            this.boardRCC.push(new RCC(this.board, new Point(col, 1), new Point(col, this.rccSize)));
        }
        console.log('rows');
        for (let row: number = 1; row <= this.rccSize; row++) {
            this.boardRCC.push(new RCC(this.board, new Point(1, row), new Point(this.rccSize, row)));
        }
        console.log('cells');
        for (let cell: number = 1; cell <= this.rccSize; cell++) {
            let cellCol: number = (cell - 1) % 3 + 1; // 3 of these
            let cellRow: number = Math.floor((cell - 1) / 3 + 1); // 3 of these
            let colStart: number = ((cellCol - 1) * 3) + 1; // 9 of these
            let rowStart: number = ((cellRow - 1) * 3) + 1; // 9 of these
            this.boardRCC.push(new RCC(this.board, new Point(colStart, rowStart),
                new Point(colStart + 2, rowStart + 2)));
        }
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
        items.map((item) => this.push(item));
        console.log(`Board / load - size: ${this.boardSize} - board: ${this.printBoardDebug()}`);
    }

    public printBoardDebug() {
        // let rccSize = Math.sqrt(this.boardSize);
        let singleSize = Math.sqrt(this.rccSize);   // height and width of each cell
        let out: string = '************\n';
        for (let i = 0; i < this.rccSize; i++) {
            out += '|';
            for (let j = 0; j < this.rccSize; j++) {
                let index = i * this.rccSize + j;
                out += this.board[index];
                if ((j + 1) % singleSize === 0) {
                    out += '|';
                }
            }
            out += '\n';
            if ((i + 1) % singleSize === 0) {
                out += '------------\n';
            }
        }
        out += '************\n';
        console.log(out);
    }
}

class Sudoku extends React.Component {
    rccSize: number = 9;  // Size of each row, cell and columns
    board: Board;     // Board of the numbers in each place - top-left to bottom-right

    constructor(props: {}) {
        super(props);
        this.assertDimensions();
        this.buildBoard();
    }

    assertDimensions() {
        if (this.rccSize % 3 !== 0) {
            let msg: string = `Board row/height value must be divisible by 3 - it is: ${this.rccSize}`;
            throw new Error(msg);
        }
    }

    buildBoard() {
        this.board = new Board(this.rccSize, this.exampleBoard1());
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

    getCells(row: number) {
        let indexInRowStart: number = (row - 1) * 9 + 1;
        let indexInRowEnd: number = indexInRowStart + 8;
        // console.log('getCells - indexInRowStart: ' + indexInRowStart + ', indexInRowEnd: ' + indexInRowEnd);
        // console.log('board length: ', this.board.length);
        return this.board.board.map((item: number, index: number) => {
            // index+1 since index is 0-based
            if (index + 1 >= indexInRowStart && index + 1 <= indexInRowEnd) {
                // console.log('  output index: ', index);
                let val = item > 0 ? item : '';
                let tdFooter = index > 8 && Math.floor((index) / 9) % 3 === 0 ? 'floor' : '';
                let tdWall = (index + 1) % 3 === 0 ? 'wall' : '';

                let classes = '';

                if (tdFooter.length > 0) {
                    classes += 'cellFooter ';
                }
                if (tdWall.length > 0) {
                    classes += 'cellWall';
                }
                return (<td key={index} className={classes}><select>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value={val} selected>{val}</option>
                </select></td>);
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
