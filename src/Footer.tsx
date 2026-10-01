import { ChangeEvent } from 'react';

export interface OptionsProp {
    showHints: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;   // Inform the parent of changes
}

/**
 * The Footer hold the options
 */
export default function Footer(props: OptionsProp) {
    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        props.onChange(event);
    };
    return (
        <div>
            <div>
                <label>Show Hints:
                    <input
                        name="showHints"
                        type="checkbox"
                        checked={props.showHints}
                        onChange={handleValueChange}
                    />
                </label>
            </div>
            <div>
                <Information/>
            </div>
        </div>
    );
}

function Information() {
    return (
        <p>See <a href="https://github.com/oehm-smith/sudokureact">the code on Github</a></p>
    );
}
