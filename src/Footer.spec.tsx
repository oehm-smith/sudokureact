// ABOUTME: Tests for Footer — the Show Hints option and the link to the source.
// ABOUTME: Footer had no default export at all, so none of this ever reached the page.

import { ChangeEvent } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Footer from './Footer';

describe('Footer', () => {
    it('renders', () => {
        render(<Footer showHints={true} onChange={() => undefined}/>);

        expect(screen.getByLabelText(/show hints/i)).toBeInTheDocument();
    });

    it('reflects the showHints option', () => {
        const {rerender} = render(<Footer showHints={true} onChange={() => undefined}/>);

        expect(screen.getByLabelText(/show hints/i)).toBeChecked();

        rerender(<Footer showHints={false} onChange={() => undefined}/>);

        expect(screen.getByLabelText(/show hints/i)).not.toBeChecked();
    });

    it('reports a change to its parent', async () => {
        // Read the event inside the handler: the checkbox is controlled, so by the time the
        // assertion runs React has already rendered it back to the prop's value.
        const seen: Array<{name: string; checked: boolean}> = [];
        const onChange = jest.fn((event: ChangeEvent<HTMLInputElement>) => {
            seen.push({name: event.target.name, checked: event.target.checked});
        });
        render(<Footer showHints={true} onChange={onChange}/>);

        await userEvent.click(screen.getByLabelText(/show hints/i));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(seen).toEqual([{name: 'showHints', checked: false}]);
    });

    it('links to the source', () => {
        render(<Footer showHints={true} onChange={() => undefined}/>);

        expect(screen.getByRole('link', {name: /code on github/i}))
            .toHaveAttribute('href', 'https://github.com/oehm-smith/sudokureact');
    });
});
