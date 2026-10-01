// ABOUTME: One square of the board — a dropdown of the values that square may take.
// ABOUTME: Presentational only: the parent computes which values are on offer.

import { ChangeEvent } from 'react';

export interface SelectorProps {
    index: number;              // Index in board for Entry this selector is for
    value: number;              // Current value of the Entry, 0 for blank
    locked: boolean;            // Entries from the starting board can not be changed
    optionValues: number[];     // Values on offer, including a leading 0 for 'blank'
    onChange: (value: string, index: number) => void;   // Inform the parent of changes
}

/**
 * Selector is a React impl of an HTML <select with drop-down <options
 */
export default function Selector(props: SelectorProps) {
    const handleValueChange = (event: ChangeEvent<HTMLSelectElement>) => {
        props.onChange(event.target.value, props.index);
    };

    if (props.locked) {
        return (<label>{props.value}</label>);
    }

    return (
        <select value={props.value} onChange={handleValueChange}>
            {props.optionValues.map((item: number) => (
                // The value attribute is explicit so the select matches on the number rather
                // than on the option's rendered text, which is blank for 0.
                <option key={`${props.index}-${item}`} value={item}>{item > 0 ? item : ''}</option>
            ))}
        </select>
    );
}
