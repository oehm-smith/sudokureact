import * as React from 'react';

export interface SelectorProps {
    value: number|'';             // Value set in selector
    index: number;          // Index in board for Entry this selector is for
    optionValues: number[]; // All possible values in the selector.  Value must be one of them
    onChange: Function;     // Function to inform the parent of changes
}

/**
 * Selector is a React impl of an HTML <select with drop-down <options
 */
export default class Selector extends React.Component<SelectorProps, {}> {
    constructor(props: SelectorProps) {
        super(props);
        // this.state = {selectorValue: props.board[props.index]};
        this.handleValueChange = this.handleValueChange.bind(this);   // TODO - Can I avoid the bind with Typescript?
    }

    makeOption = function (item: number, theseOptionsIndex: number, boardIndex: number): JSX.Element {
        let selectorOptionIndex = '' + boardIndex + '-' + theseOptionsIndex;
        return (<option key={selectorOptionIndex}>{'' + item}</option>);
    };

    render(): JSX.Element {
        return (
            <select value={this.props.value} onChange={this.handleValueChange}>
        <option key={this.props.index}>{this.props.value}</option>
        {this.props.optionValues.map((item: number, optionsIndex: number) =>
            this.makeOption(item, optionsIndex, this.props.index))}
        </select>);
    }

    private handleValueChange(event: any) {  // TODO - type of event
        this.props.onChange(event.target.value, this.props.index);
    }
}
