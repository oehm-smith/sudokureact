// ABOUTME: Integration test for App — header, board and footer wired together.
// ABOUTME: App rendered nothing at all before Footer was exported, so this is the regression guard.

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import App from './App';

/** The values on offer in the board's first square. */
const firstSquareOptions = (container: HTMLElement): string[] =>
    within(container.querySelectorAll('td')[0] as HTMLElement)
        .getAllByRole('option')
        .map((option) => (option as HTMLOptionElement).value);

/**
 * Click the Show Hints checkbox.
 *
 * Toggling it sends new options down to the grid, which recomputes its hints asynchronously,
 * so the click is flushed inside act before the test asserts.
 */
const toggle = async (checkbox: HTMLElement): Promise<void> => {
    await act(async () => {
        fireEvent.click(checkbox);
    });
};

describe('App', () => {
    it('renders the header, the board and the footer', async () => {
        const {container} = render(<App/>);

        expect(screen.getByRole('heading', {name: /welcome to sudoku/i})).toBeInTheDocument();
        expect(container.querySelectorAll('tr')).toHaveLength(9);
        expect(screen.getByLabelText(/show hints/i)).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /code on github/i})).toBeInTheDocument();

        await waitFor(() => expect(firstSquareOptions(container).length).toBeGreaterThan(1));
    });

    it('starts with hints on', async () => {
        const {container} = render(<App/>);

        expect(screen.getByLabelText(/show hints/i)).toBeChecked();
        await waitFor(() => expect(firstSquareOptions(container)).toEqual(['0', '2', '3', '4']));
    });

    it('turns hints off and back on from the footer', async () => {
        const {container} = render(<App/>);
        const checkbox = screen.getByLabelText(/show hints/i);

        await waitFor(() => expect(firstSquareOptions(container)).toEqual(['0', '2', '3', '4']));

        await toggle(checkbox);

        expect(checkbox).not.toBeChecked();
        await waitFor(() => expect(firstSquareOptions(container)).toHaveLength(10));

        await toggle(checkbox);

        expect(checkbox).toBeChecked();
        await waitFor(() => expect(firstSquareOptions(container)).toEqual(['0', '2', '3', '4']));
    });
});
