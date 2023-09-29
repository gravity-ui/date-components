import React from 'react';

import {TextInput, useFocusWithin} from '@gravity-ui/uikit';

import {block} from '../../utils/cn.js';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    KeyboardEvents,
    StyleProps,
    TextInputExtendProps,
    TextInputProps,
} from '../types/index.js';

import {useDateFieldProps} from './hooks/useDateFieldProps.js';
import {useDateFieldState} from './hooks/useDateFieldState.js';
import type {DateFieldStateOptions} from './hooks/useDateFieldState.js';

import './DateField.scss';

const b = block('date-field');

export interface DateFieldProps
    extends DateFieldStateOptions,
        TextInputProps,
        TextInputExtendProps,
        DomProps,
        FocusableProps,
        KeyboardEvents,
        StyleProps,
        AccessibilityProps {}

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
        </div>
    );
}
