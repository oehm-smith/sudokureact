// ABOUTME: Mounting test for App — the regression guard for the crash on first render.
// ABOUTME: App imported an unexported Footer, so rendering it threw and nothing appeared.

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import App from './App';

/**
 * Mount the app and let the squares finish their asynchronous hint lookups, so the test
 * does not assert against a half-settled tree.
 */
const mount = async (): Promise<HTMLElement> => {
    const {container} = render(<App/>);
    await waitFor(() => expect(container.querySelectorAll('td')).toHaveLength(81));
    await act(async () => undefined);
    return container;
};

describe('App', () => {
    it('renders without throwing', async () => {
        await mount();

        expect(screen.getByRole('heading', {name: /welcome to sudoku/i})).toBeInTheDocument();
    });

    it('renders the board as nine rows of nine squares', async () => {
        const container = await mount();

        const rows = container.querySelectorAll('tr');
        expect(rows).toHaveLength(9);
        rows.forEach((row) => expect(row.querySelectorAll('td')).toHaveLength(9));
    });

    it('renders the footer, which never appeared before', async () => {
        await mount();

        expect(screen.getByLabelText(/show hints/i)).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /code on github/i})).toBeInTheDocument();
    });

    it('shows the given squares as text and the blanks as dropdowns', async () => {
        const container = await mount();
        const squares = container.querySelectorAll('td');

        // The first row of the example board is 0,0,0,1,0,5,0,6,8.
        expect(within(squares[0] as HTMLElement).getByRole('combobox')).toBeInTheDocument();
        expect(within(squares[3] as HTMLElement).queryByRole('combobox')).not.toBeInTheDocument();
        expect(squares[3]).toHaveTextContent('1');
    });

    it('starts with hints on, and the option can be turned off', async () => {
        await mount();
        const checkbox = screen.getByLabelText(/show hints/i);

        expect(checkbox).toBeChecked();

        await act(async () => {
            fireEvent.click(checkbox);
        });

        expect(checkbox).not.toBeChecked();
    });
});
