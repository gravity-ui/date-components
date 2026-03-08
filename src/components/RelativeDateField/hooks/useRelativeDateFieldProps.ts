import React from 'react';

import type {TextInputProps} from '@gravity-ui/uikit';

import type {CalendarProps} from '../../Calendar';
import type {DateFieldProps} from '../../DateField';
import type {RelativeDateFieldProps} from '../RelativeDateField';

import type {RelativeDateFieldState} from './useRelativeDateFieldState';

interface RelativeDateProps {
    inputProps: TextInputProps;
    calendarProps: CalendarProps;
    timeInputProps: DateFieldProps;
}

export function useRelativeDateFieldProps(
    state: RelativeDateFieldState,
    props: RelativeDateFieldProps,
): RelativeDateProps {
    const lastCorrectDate = state.lastCorrectDate ? state.lastCorrectDate.startOf('day') : null;
    const [prevCorrectDate, setPrevCorrectDate] = React.useState(lastCorrectDate);
    const [focusedDate, setFocusedDate] = React.useState(lastCorrectDate);

    if (lastCorrectDate && (!prevCorrectDate || !lastCorrectDate.isSame(prevCorrectDate, 'day'))) {
        setPrevCorrectDate(lastCorrectDate);
        setFocusedDate(lastCorrectDate);
    }

    return {
        inputProps: {
            size: props.size,
            autoFocus: props.autoFocus,
            value: state.text,
            onUpdate: state.setText,
            disabled: state.disabled,
            hasClear: props.hasClear,
            validationState: state.validationState,
            errorMessage: props.errorMessage,
            errorPlacement: props.errorPlacement,
            label: props.label,
            id: props.id,
            startContent: props.startContent,
            endContent: props.endContent,
            pin: props.pin,
            view: props.view,
            placeholder: props.placeholder,
            onKeyDown: props.onKeyDown,
            onKeyUp: props.onKeyUp,
            onBlur(e) {
                props.onBlur?.(e);
                state.confirmValue();
            },
            onFocus: props.onFocus,
            controlProps: {
                'aria-label': props['aria-label'] || undefined,
                'aria-labelledby': props['aria-labelledby'] || undefined,
                'aria-describedby': props['aria-describedby'] || undefined,
                'aria-details': props['aria-details'] || undefined,
                'aria-disabled': state.disabled || undefined,
                readOnly: state.readOnly,
            },
        },
        calendarProps: {
            size: props.size === 's' ? 'm' : props.size,
            readOnly: true,
            value: state.lastCorrectDate,
            focusedValue: focusedDate,
            onFocusUpdate: setFocusedDate,
        },
        timeInputProps: {
            size: props.size,
            readOnly: true,
            value: state.lastCorrectDate,
            format: 'LTS',
        },
    };
}
