import * as React from 'react';

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
        this.handleValueChange = this.handleValueChange.bind(this);   // TODO - Can I avoid the bind with Typescript?
    }

    render(): JSX.Element {
        return (<div>
            <label>Show Hints:<input name="showHints" type="checkbox" checked={this.props.showHints} onChange={this.handleValueChange}/></label>
        </div>);
    }

    private handleValueChange(event: any) {  // TODO - type of event
        this.props.onChange(event.target);
    }
}
