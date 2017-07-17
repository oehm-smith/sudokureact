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

interface SelectorState {
    optionValues: number[];
}
/**
 * Selector is a React impl of an HTML <select with drop-down <options
 */
export default class Selector extends React.Component<SelectorProps, SelectorState> {
    constructor(props: SelectorProps) {
        super(props);
        this.state = {optionValues: []};
        this.handleValueChange = this.handleValueChange.bind(this);   // TODO - Can I avoid the bind with Typescript?
    }

    setStateAsync(state: SelectorState) {
        return new Promise((resolve) => {
            this.setState(state, resolve);
        });
    }

    async componentDidMount() {
        const possibleValues: number[] = await this.buildPossibleValues();
        await this.setStateAsync({optionValues: possibleValues})
    }

    async buildPossibleValues(): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            if (this.props.options.showHints) {
                resolve([0].concat(this.props.board.getPossibleValuesByIndex(this.props.index)));
            } else {
                resolve(_.range(0, 10));
            }
        });
    }

    makeOption = function (item: number, theseOptionsIndex: number, boardIndex: number): JSX.Element {
        let selectorOptionIndex = '' + boardIndex + '-' + theseOptionsIndex;
        let optItem: string = item > 0 ? '' + item : '';
        return (<option key={selectorOptionIndex}>{optItem}</option>);
    };

    render(): JSX.Element {
        const locked: boolean = this.props.board.staticEntries[this.props.index];
        const value: number = this.props.board.board[this.props.index];
        const optionValues: number[] = this.state.optionValues;    // buildPossibleValues();

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
