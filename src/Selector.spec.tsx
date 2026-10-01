// ABOUTME: Tests for Selector — one square's dropdown.
// ABOUTME: Covers locked squares, the option list and reporting a move upwards.

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Selector from './Selector';

const optionValues = (): string[] =>
    within(screen.getByRole('combobox'))
        .getAllByRole('option')
        .map((option) => (option as HTMLOptionElement).value);

describe('Selector', () => {
    it('renders a locked square as plain text, with no dropdown', () => {
        render(<Selector index={4} value={7} locked={true} optionValues={[0, 7]}
                         onChange={() => undefined}/>);

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('offers exactly the values it was given', () => {
        render(<Selector index={0} value={0} locked={false} optionValues={[0, 2, 3, 4]}
                         onChange={() => undefined}/>);

        expect(optionValues()).toEqual(['0', '2', '3', '4']);
    });

    it('offers a single blank for an empty square', () => {
        render(<Selector index={0} value={0} locked={false} optionValues={[0, 2, 3]}
                         onChange={() => undefined}/>);

        const blanks = within(screen.getByRole('combobox'))
            .getAllByRole('option')
            .filter((option) => option.textContent === '');

        expect(blanks).toHaveLength(1);
    });

    it('selects on the number rather than on the rendered text', () => {
        render(<Selector index={0} value={3} locked={false} optionValues={[0, 2, 3]}
                         onChange={() => undefined}/>);

        expect(screen.getByRole('combobox')).toHaveValue('3');
    });

    it('shows a blank square as blank rather than as 0', () => {
        render(<Selector index={0} value={0} locked={false} optionValues={[0, 2, 3]}
                         onChange={() => undefined}/>);

        expect((screen.getByRole('combobox') as HTMLSelectElement).selectedOptions[0].textContent)
            .toBe('');
    });

    it('reports a move with its value and board index', async () => {
        const onChange = jest.fn();
        render(<Selector index={42} value={0} locked={false} optionValues={[0, 2, 3]}
                         onChange={onChange}/>);

        await userEvent.selectOptions(screen.getByRole('combobox'), '3');

        expect(onChange).toHaveBeenCalledWith('3', 42);
    });

    it('reports clearing a square as 0', async () => {
        const onChange = jest.fn();
        render(<Selector index={42} value={3} locked={false} optionValues={[0, 2, 3]}
                         onChange={onChange}/>);

        await userEvent.selectOptions(screen.getByRole('combobox'), '0');

        expect(onChange).toHaveBeenCalledWith('0', 42);
    });
});
