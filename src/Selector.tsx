import { ChangeEvent, useEffect, useState } from 'react';
import { SudokuOptions } from './Sudoku';
import Board from './Board';
import { arrayRange } from './utils.ts';

export interface SelectorProps {
    index: number;          // Index in board for Entry this selector is for
    board: Board;
    options: SudokuOptions;
    onChange: Function;     // Function to inform the parent of changes
}

// interface SelectorState {
//     optionValues: number[];
// }

/**
 * Selector is a React impl of an HTML <select with drop-down <options
 */
export default function Selector(props: SelectorProps) {
    const [state, setState] = useState({optionValues: new Array<number>()});

    useEffect(() => {
        const doIt = async () => {
            const possibleValues: number[] = await buildPossibleValues();
            setState({optionValues: possibleValues});
        };
        doIt();
    }, []);

    useEffect(() => {
        const doIt = async () => {
            const possibleValues: number[] = await buildPossibleValues(props);
            setState({optionValues: possibleValues});
        }
        doIt();
    }, [props]);

    const makeOption = function (item: number, theseOptionsIndex: number, boardIndex: number): JSX.Element {
        let selectorOptionIndex = '' + boardIndex + '-' + theseOptionsIndex;
        let optItem: string = item > 0 ? '' + item : '';
        return (<option key={selectorOptionIndex}>{optItem}</option>);
    };

    const locked: boolean = props.board.staticEntries[props.index];
    const value: number = props.board.board[props.index];
    const optionValues: number[] = state.optionValues;
    // console.log(`render - index: ${this.props.index}, showHints: ${this.props.options.showHints}`);

    const handleValueChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        props.onChange(event.target.value, props.index);
    };

    if (locked) {
        return (<label>{value}</label>);
    } else {
        return (
            <select value={value} onChange={handleValueChange}>
                <option key={props.index}>{value > 0 ? value : ''}</option>
                {optionValues.map((item: number, optionsIndex: number) =>
                                      makeOption(item, optionsIndex, props.index))}
            </select>);
    }

    /**
     * Return a (Promise to the) array of possible values at the given cell.
     * @param newProps optional that comes from new property values that happens when the input properties change.  Ie.
     * When the 'showHints' button is changed.
     * @returns {Promise<number[]>}
     */
    const buildPossibleValues = (newProps?: SelectorProps): Promise<number[]> => {
        let propsToUse: SelectorProps = newProps ? newProps : props;
        return new Promise<number[]>(async (resolve) => {
            if (propsToUse.options.showHints) {
                const values = await propsToUse.board.getPossibleValuesByIndex(propsToUse.index);
                resolve([0].concat(values));
            } else {
                const values = arrayRange(0, 9);
                resolve(values);
            }
        });
    };

    // private setStateAsync(state: SelectorState) {
    //     return new Promise((resolve) => {
    //         this.setState(state, resolve);
    //     });
    // }
}
