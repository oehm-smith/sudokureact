import * as React from 'react';
import * as _ from 'lodash';
import { ChangeEvent } from 'react';
import { SudokuOptions } from './Sudoku';
import Board from './Board';

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
        this.handleValueChange = this.handleValueChange.bind(this);
    }

    async componentDidMount() {
        const possibleValues: number[] = await this.buildPossibleValues();
        return await this.setStateAsync({optionValues: possibleValues});
    }

    async componentWillReceiveProps(newProps: SelectorProps) {
        const possibleValues: number[] = await this.buildPossibleValues(newProps);
        return this.setStateAsync({optionValues: possibleValues});
    }

    makeOption = function (item: number, theseOptionsIndex: number, boardIndex: number): JSX.Element {
        let selectorOptionIndex = '' + boardIndex + '-' + theseOptionsIndex;
        let optItem: string = item > 0 ? '' + item : '';
        return (<option key={selectorOptionIndex}>{optItem}</option>);
    };

    render(): JSX.Element {
        const locked: boolean = this.props.board.staticEntries[this.props.index];
        const value: number = this.props.board.board[this.props.index];
        const optionValues: number[] = this.state.optionValues;
        // console.log(`render - index: ${this.props.index}, showHints: ${this.props.options.showHints}`);

        if (locked) {
            return (<label>{value}</label>);
        } else {
            return (
                <select value={value} onChange={(val) => this.handleValueChange(val)}>
                    <option key={this.props.index}>{value > 0 ? value : ''}</option>
                    {optionValues.map((item: number, optionsIndex: number) =>
                        this.makeOption(item, optionsIndex, this.props.index))}
                </select>);
        }
    }

    /**
     * Return a (Promise to the) array of possible values at the given cell.
     * @param newProps optional that comes from new property values that happens when the input properties change.  Ie.
     * When the 'showHints' button is changed.
     * @returns {Promise<number[]>}
     */
    private async buildPossibleValues(newProps?: SelectorProps): Promise<number[]> {
        let props: SelectorProps = newProps ? newProps : this.props;
        return new Promise<number[]>(async (resolve) => {
            if (props.options.showHints) {
                const values = await props.board.getPossibleValuesByIndex(props.index);
                resolve([0].concat(values));
            } else {
                const values = _.range(0, 10);
                resolve(values);
            }
        });
    }

    private setStateAsync(state: SelectorState) {
        return new Promise((resolve) => {
            this.setState(state, resolve);
        });
    }

    private async handleValueChange(event: ChangeEvent<HTMLSelectElement>) {
        this.props.onChange(event.target.value, this.props.index);
    }
}
