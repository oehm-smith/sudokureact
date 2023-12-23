import * as React from 'react';
import { ChangeEvent } from 'react';

export interface OptionsProp {
    showHints: boolean;
    onChange: Function;     // Function to inform the parent of changes
}

/**
 * The Footer hold the options
 */
async function Footer(props) {
    const handleValueChange = async (event: ChangeEvent<HTMLInputElement>) => {
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
