'use client';

import React from 'react';

import {TextInput, useFocusWithin} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import {filterDOMProps} from '../utils/filterDOMProps';

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

    const DOMProps = filterDOMProps(props);
    delete DOMProps.id;

    return (
        <div {...DOMProps} className={b(null, className)} style={props.style} {...focusWithinProps}>
            <TextInput
                {...inputProps}
                value={state.isEmpty && !isActive && props.placeholder ? '' : inputProps.value}
            />
            <HiddenInput
                name={props.name}
                value={state.value}
                toStringValue={(value) => value?.toISOString() ?? ''}
                onReset={(value) => {
                    state.setValue(value);
                }}
                disabled={state.disabled}
                form={props.form}
            />
        </div>
    );
}
