// ABOUTME: The Sudoku grid — owns the Board and renders one Selector per square.
// ABOUTME: Hints are computed here once per board change, not independently by each square.

import { useCallback, useEffect, useState } from 'react';
import './App.css';
import Selector from './Selector';
import Board from './Board';
import { assertDimensions, buildClasses, optionValuesFor } from './grid';
import { exampleBoard1 } from './puzzles';
import { arrayRange } from './utils.ts';

export interface SudokuOptions {
    showHints: boolean;
}

interface SudokuProps {
    options: SudokuOptions;
}

const RCC_SIZE = 9;     // Size of each row, cell and column

export default function Sudoku(props: SudokuProps) {
    const [board] = useState<Board>(() => {
        assertDimensions(RCC_SIZE);
        return new Board(RCC_SIZE, exampleBoard1());
    });
    // Bumped on every move. The board array is mutated in place (see handleValueChange), so this
    // counter - not the board's identity - is what tells React a render is due.
    const [version, setVersion] = useState<number>(0);
    const [hints, setHints] = useState<number[][]>([]);

    const showHints = props.options.showHints;

    useEffect(() => {
        let cancelled = false;

        const computeHints = async () => {
            const everyValue = arrayRange(1, board.size);
            const values: number[][] = showHints
                ? await Promise.all(board.board.map((_, index) => board.getPossibleValuesByIndex(index)))
                : board.board.map(() => everyValue);

            if (!cancelled) {
                setHints(values);
            }
        };

        computeHints();

        return () => {
            cancelled = true;
        };
    }, [board, showHints, version]);

    /**
     * Record a move made in a child Selector.
     *
     * The board array is mutated rather than replaced, deliberately: every RCC holds a live
     * reference to this same array, which is how a region's used values stay current. Anything
     * added later that memoises on board identity (React.memo, useMemo) will not see the change.
     */
    const handleValueChange = useCallback((value: string, index: number) => {
        board.board[index] = parseInt(value === '' ? '0' : value, 10);
        setVersion((previous) => previous + 1);
    }, [board]);

    const rows = arrayRange(1, board.size).map((row: number) => {
        const start = (row - 1) * board.size;
        const cells = board.board.slice(start, start + board.size).map((value: number, offset: number) => {
            const index = start + offset;
            return (
                <td key={index} className={buildClasses(index, board.size)}>
                    <Selector
                        index={index}
                        value={value}
                        locked={board.staticEntries[index]}
                        optionValues={optionValuesFor(value, hints[index] ?? [])}
                        onChange={handleValueChange}
                    />
                </td>);
        });
        return (<tr key={row}>{cells}</tr>);
    });

    return (
        <div>
            <form>
                <table>
                    <tbody>{rows}</tbody>
                </table>
            </form>
        </div>
    );
}
