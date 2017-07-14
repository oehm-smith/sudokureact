import * as React from 'react';
import * as _ from 'lodash';
import './App.css';
import Board from './Board';
import Selector from './Selector';

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

interface SodukuState {
    board: Board;
}
class Sudoku extends React.Component<{}, SodukuState> {
    private rccSize: number = 9;  // Size of each row, cell and columns

    constructor(props: {}) {
        super(props);
        this.assertDimensions();
        this.state = {board: this.buildBoard()};
        this.handleValueChange = this.handleValueChange.bind(this);
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

    /**
     * Change state based on event in a child component
     * @param value
     * @param index
     */
    handleValueChange(value: string, index: number) {
        console.log(`Sudoku handle change - value: ${value}, index: ${index}`);
        let newBoard: Board = this.state.board;
        newBoard.board[index] = parseInt(value);
        this.setState((prevState: SodukuState) => ({
            board: newBoard
        }));
    }

    getCells(row: number): {} {
        let indexInRowStart: number = (row - 1) * 9 + 1;
        let indexInRowEnd: number = indexInRowStart + 8;
        // console.log('getCells - indexInRowStart: ' + indexInRowStart + ', indexInRowEnd: ' + indexInRowEnd);
        // console.log('board length: ', this.board.length);
        return this.state.board.board.map((item: number, index: number) => {
            // index+1 since index is 0-based
            // console.log('borad map - value: ', item);
            if (index + 1 >= indexInRowStart && index + 1 <= indexInRowEnd) {
                let val: number | '' = item > 0 ? item : '';
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
                const possibleValues = this.state.board.getPossibleValuesByIndex(index);
                console.log(`selected: ${this.state.board.board[index]}`);
                console.log(`  possibleValues: ${possibleValues}`);
                return (
                    <td key={index} className={classes}>
                        <Selector
                            value={val}
                            index={index}
                            optionValues={possibleValues}
                            onChange={this.handleValueChange}
                        />
                    </td>);
            } else {
                return '';
            }
        });
    }

    getRow(row: number): JSX.Element {
        return (<tr key={row}>{this.getCells(row)}</tr>);
    }

    getRows(): JSX.Element {
        const rows = _.range(1, 10).map((row: number) => {
            return this.getRow(row);
        });
        return <tbody>{rows}</tbody>;
    }

    render(): JSX.Element {
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
}

class App extends React.Component<{}, {}> {
    render(): JSX.Element {
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
