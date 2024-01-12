import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {TextInput, useFocusWithin} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import type {RangeValue} from '../types';

import {type DateFieldProps, useDateFieldProps} from './hooks/useDateFieldProps';
import {useRangeDateFieldState} from './hooks/useRangeDateFieldState';

import './RangeDateField.scss';

const b = block('range-date-field');

export type RangeDateFieldProps = DateFieldProps<RangeValue<DateTime>>;

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
        </div>
    );
}
