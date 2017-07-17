import * as React from 'react';
import * as _ from 'lodash';
import './App.css';
import Selector from './Selector';
import Board from './Board';

interface SodukuState {
    board: Board;
}

export interface SudokuOptions {
    showHints: boolean;
}

interface SodukuProps {
    options: SudokuOptions;
}

export default class Sudoku extends React.Component<SodukuProps, SodukuState> {
    private rccSize: number = 9;  // Size of each row, cell and columns

    constructor(props: SodukuProps) {
        super(props);
        this.assertDimensions();
        this.state = {board: this.buildBoard()};
        this.handleValueChange = this.handleValueChange.bind(this);
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

    private assertDimensions() {
        if (! Number.isInteger(Math.sqrt(this.rccSize))) {
            let msg: string = `Board row/height value must have a proper integer square root - row/height is: `
                + `${this.rccSize}`;
            throw new Error(msg);
        }
    }

    private exampleBoard1(): number[] {
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
    /* Render and related methods */
    /* ********************************************************** */

    /**
     * Change state based on event in a child component
     * @param value
     * @param index
     */
    private handleValueChange(value: string, index: number) {
        console.log(`Sudoku handle change - value: ${value}, index: ${index}`);
        let newBoard: Board = this.state.board;
        newBoard.board[index] = parseInt(value === '' ? '0' : value, 10);
        this.setState((prevState: SodukuState) => ({
            board: newBoard
        }));
    }

    buildClasses = (index: number): string => {
        let tdFooter = index > 8 && Math.ceil((index + 1) / 9) % 3 === 0 ? 'floor' : '';
        let tdWall = (index + 1) % 3 === 0 ? 'wall' : '';
        let classes = '';

        if (tdFooter.length > 0) {
            classes += 'cellFooter ';
        }
        if (tdWall.length > 0) {
            classes += 'cellWall';
        }

        return classes;
    }

    private getCells(row: number): {} {
        let indexInRowStart: number = (row - 1) * 9 + 1;
        let indexInRowEnd: number = indexInRowStart + 8;
        // console.log('getCells - indexInRowStart: ' + indexInRowStart + ', indexInRowEnd: ' + indexInRowEnd);
        // console.log('board length: ', this.board.length);
        return this.state.board.board.map((item: number, index: number) => {
            // index+1 since index is 0-based but board coords are 1-based
            if (index + 1 >= indexInRowStart && index + 1 <= indexInRowEnd) {
                let classes = this.buildClasses(index);
                console.log(`selected: ${this.state.board.board[index]}`);
                return (
                    <td key={index} className={classes}>
                        <Selector
                            index={index}
                            onChange={this.handleValueChange}
                            board={this.state.board}
                            options={this.props.options}
                        />
                    </td>);
            } else {
                return '';
            }
        });
    }

    private getRow(row: number): JSX.Element {
        return (<tr key={row}>{this.getCells(row)}</tr>);
    }

    private getRows(): JSX.Element {
        const rows = _.range(1, 10).map((row: number) => {
            return this.getRow(row);
        });
        return <tbody>{rows}</tbody>;
    }

    private buildBoard(): Board {
        // TODO - customise (or multiple selections for) the initial board
        return new Board(this.rccSize, this.exampleBoard1());
    }
}
