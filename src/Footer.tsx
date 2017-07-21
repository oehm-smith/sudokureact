import * as React from 'react';
import { ChangeEvent } from 'react';

export interface OptionsProp {
    showHints: boolean;
    onChange: Function;     // Function to inform the parent of changes
}

/**
 * The Footer hold the options
 */
export default class Footer extends React.Component<OptionsProp, {}> {
    constructor(props: OptionsProp) {
        super(props);
        this.handleValueChange = this.handleValueChange.bind(this);
    }

    render(): JSX.Element {
        return (
            <div>
                <div>
                    <label>Show Hints:
                        <input
                            name="showHints"
                            type="checkbox"
                            checked={this.props.showHints}
                            onChange={this.handleValueChange}
                        />
                    </label>
                </div>
                <div>
                    <Information/>
                </div>
            </div>
        );
    }

    handleValueChange = async (event: ChangeEvent<HTMLInputElement>) => {//comment
        this.props.onChange(event);
    }
}

class Information extends React.Component<{}, {}> {
    constructor(props: OptionsProp) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <p>See <a href="https://github.com/oehm-smith/sudokureact">the code on Github</a></p>
        );
    }
}
