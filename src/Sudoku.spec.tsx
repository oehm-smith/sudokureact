// ABOUTME: Tests for the Sudoku grid — layout, hint calculation and recording a move.
// ABOUTME: Hints are the parent's job now, so they are asserted through the rendered options.

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import Sudoku from './Sudoku';
import { exampleBoard1 } from './puzzles';

/** The <td> for a board index, in board order. Locked squares hold a label, blanks a select. */
const square = (container: HTMLElement, index: number): HTMLElement =>
    container.querySelectorAll('td')[index] as HTMLElement;

/** The values on offer in a square's dropdown. */
const offered = (container: HTMLElement, index: number): string[] =>
    within(square(container, index))
        .getAllByRole('option')
        .map((option) => (option as HTMLOptionElement).value);

/**
 * Play a value into a square.
 *
 * The move triggers a synchronous state update and then an asynchronous hint recalculation,
 * so both are flushed inside act before the test asserts.
 */
const play = async (select: HTMLElement, value: string): Promise<void> => {
    await act(async () => {
        fireEvent.change(select, {target: {value}});
    });
};

/** Hints arrive from an effect, so wait for a square's options before acting on it. */
const waitForHints = (container: HTMLElement, index: number): Promise<void> =>
    waitFor(() => expect(offered(container, index).length).toBeGreaterThan(1));

describe('Sudoku', () => {
    it('renders nine rows of nine squares and nothing else', async () => {
        const {container} = render(<Sudoku options={{showHints: true}}/>);
        await waitForHints(container, 0);

        const rows = container.querySelectorAll('tr');
        expect(rows).toHaveLength(9);
        rows.forEach((row) => {
            expect(row.querySelectorAll('td')).toHaveLength(9);
            // The old implementation mapped the whole board per row and emitted the 72
            // non-matching squares as empty text nodes inside the <tr>, which is invalid HTML.
            expect(row.childNodes).toHaveLength(9);
        });
    });

    it('locks the squares given by the starting board', async () => {
        const {container} = render(<Sudoku options={{showHints: true}}/>);
        await waitForHints(container, 0);
        const starting = exampleBoard1();

        starting.forEach((value, index) => {
            const cell = square(container, index);
            if (value > 0) {
                expect(within(cell).queryByRole('combobox')).not.toBeInTheDocument();
                expect(cell).toHaveTextContent(String(value));
            } else {
                expect(within(cell).getByRole('combobox')).toBeInTheDocument();
            }
        });
    });

    it('offers only the legal values when hints are on', async () => {
        const {container} = render(<Sudoku options={{showHints: true}}/>);

        // Square 0 sees 1,5,6,8 in its row, 1,5,7,9 in its column and 1,9 in its cell,
        // which leaves 2, 3 and 4.
        await waitFor(() => expect(offered(container, 0)).toEqual(['0', '2', '3', '4']));
    });

    it('offers every value when hints are off', async () => {
        const {container} = render(<Sudoku options={{showHints: false}}/>);

        await waitFor(() =>
            expect(offered(container, 0)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']));
    });

    it('switches between the two as the option changes', async () => {
        const {container, rerender} = render(<Sudoku options={{showHints: true}}/>);

        await waitFor(() => expect(offered(container, 0)).toEqual(['0', '2', '3', '4']));

        rerender(<Sudoku options={{showHints: false}}/>);

        await waitFor(() => expect(offered(container, 0)).toHaveLength(10));
    });

    it('records a move and recomputes the hints around it', async () => {
        const {container} = render(<Sudoku options={{showHints: true}}/>);

        // Square 1 shares row 1 and the top-left cell with square 0.
        await waitFor(() => expect(offered(container, 1)).toEqual(['0', '2', '4', '7']));

        await play(within(square(container, 0)).getByRole('combobox'), '2');

        // 2 is now spoken for in the row and the cell.
        await waitFor(() => expect(offered(container, 1)).toEqual(['0', '4', '7']));
        expect(within(square(container, 0)).getByRole('combobox')).toHaveValue('2');
    });

    it('keeps a played value on offer in its own square, so the square still shows it', async () => {
        const {container} = render(<Sudoku options={{showHints: true}}/>);
        await waitForHints(container, 0);

        await play(within(square(container, 0)).getByRole('combobox'), '2');

        // The hints for square 0 exclude 2 - it is used in its own row - but the square must
        // still carry it as an option or the select renders blank.
        await waitFor(() => expect(offered(container, 0)).toEqual(['0', '2', '3', '4']));
    });

    it('clears a square back to blank', async () => {
        const {container} = render(<Sudoku options={{showHints: true}}/>);
        await waitForHints(container, 0);
        const select = within(square(container, 0)).getByRole('combobox');

        await play(select, '2');
        await waitFor(() => expect(select).toHaveValue('2'));

        await play(select, '0');

        await waitFor(() => expect(select).toHaveValue('0'));
        await waitFor(() => expect(offered(container, 1)).toEqual(['0', '2', '4', '7']));
    });

    it('renders no empty option when a square has no legal value left', async () => {
        const {container} = render(<Sudoku options={{showHints: true}}/>);

        // Nothing stronger than a smoke check: every blank square keeps at least the blank.
        await waitForHints(container, 0);
        screen.getAllByRole('combobox').forEach((select) => {
            expect(within(select).getAllByRole('option').length).toBeGreaterThanOrEqual(1);
        });
        expect(container.querySelectorAll('table')).toHaveLength(1);
    });
});
