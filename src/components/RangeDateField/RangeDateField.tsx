'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {TextInput, useFocusWithin} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {useDateFieldProps} from '../DateField/hooks/useDateFieldProps';
import type {DateFieldProps} from '../DateField/hooks/useDateFieldProps';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import type {RangeValue} from '../types';

import {useRangeDateFieldState} from './hooks/useRangeDateFieldState';

import './RangeDateField.scss';

const b = block('range-date-field');

export type RangeDateFieldProps = DateFieldProps<RangeValue<DateTime>> & {
    /**
     * Delimiter separating the start and end parts of the range.
     * @default ' — '
     * */
    delimiter?: string;
};

export function RangeDateField({className, ...props}: RangeDateFieldProps) {
    const state = useRangeDateFieldState(props);

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
            <HiddenInput
                name={props.name}
                form={props.form}
                onReset={(v) => {
                    state.setDate(v);
                }}
                value={state.value ?? null}
                toStringValue={(v) => (v ? v.start.toISOString() : '')}
                disabled={state.disabled}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                value={state.value ?? null}
                toStringValue={(v) => (v ? v.end.toISOString() : '')}
                disabled={state.disabled}
            />
        </div>
    );
}
