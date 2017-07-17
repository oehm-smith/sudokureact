import * as React from 'react';
import * as _ from 'lodash';
import {ChangeEvent} from 'react';
import {SudokuOptions} from "./Sudoku";
import Board from "./Board";

export interface SelectorProps {
    index: number;          // Index in board for Entry this selector is for
    board: Board;
    options: SudokuOptions;
    onChange: Function;     // Function to inform the parent of changes
}

/**
 * Selector is a React impl of an HTML <select with drop-down <options
 */
export default class Selector extends React.Component<SelectorProps, {}> {
    constructor(props: SelectorProps) {
        super(props);
        // this.state = {selectorValue: props.board[props.index]};
        this.handleValueChange = this.handleValueChange.bind(this);   // TODO - Can I avoid the bind with Typescript?
    }

    makeOption = function (item: number, theseOptionsIndex: number, boardIndex: number): JSX.Element {
        let selectorOptionIndex = '' + boardIndex + '-' + theseOptionsIndex;
        let optItem: string = item > 0 ? '' + item : '';
        return (<option key={selectorOptionIndex}>{optItem}</option>);
    };

    buildPossibleValues(): number[] {
        let possibleValues: number[] = [];
        if (this.props.options.showHints) {
            possibleValues = [0].concat(this.props.board.getPossibleValuesByIndex(this.props.index));
        } else {
            possibleValues = _.range(0, 10);
        }
        return possibleValues;
    }

    render(): JSX.Element {
        const locked: boolean = this.props.board.staticEntries[this.props.index];
        const value: number = this.props.board.board[this.props.index];
        const optionValues: number[] = this.buildPossibleValues();

        if (locked) {
            return (<label>{value}</label>);
        } else {
            return (
                <select value={value} onChange={this.handleValueChange}>
                    <option key={this.props.index}>{value > 0 ? value : ''}</option>
                    {optionValues.map((item: number, optionsIndex: number) =>
                        this.makeOption(item, optionsIndex, this.props.index))}
                </select>);
        }
    }

    private handleValueChange(event: ChangeEvent<HTMLSelectElement>) {
        this.props.onChange(event.target.value, this.props.index);
    }
}
