import React from 'react';

import {TextInput, useFocusWithin} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';

import {useDateFieldProps} from './hooks/useDateFieldProps';
import type {DateFieldProps} from './hooks/useDateFieldProps';
import {useDateFieldState} from './hooks/useDateFieldState';

import './DateField.scss';

const b = block('date-field');

export function DateField({className, ...props}: DateFieldProps) {
    const state = useDateFieldState(props);

    const {inputProps} = useDateFieldProps(state, props);

    const [isActive, setActive] = React.useState(false);
    const {focusWithinProps} = useFocusWithin({
        onFocusWithinChange(isFocusWithin) {
            setActive(isFocusWithin);
        },
    });

    return (
        <div className={b(null, className)} style={props.style} {...focusWithinProps}>
            <TextInput
                {...inputProps}
                value={state.isEmpty && !isActive && props.placeholder ? '' : inputProps.value}
            />
            <input
                type="text"
                hidden
                name={props.name}
                value={state.value ? state.value.toISOString() : ''}
                // Ignore React warning
                onChange={() => {}}
            />
        </div>
    );
}
