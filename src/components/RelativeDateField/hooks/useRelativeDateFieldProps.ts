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
    const [prevCorrectDate, setPrevCorrectDate] = React.useState(state.lastCorrectDate);
    const [focusedDate, setFocusedDate] = React.useState(state.lastCorrectDate);

    if (prevCorrectDate !== state.lastCorrectDate) {
        setPrevCorrectDate(state.lastCorrectDate);
        setFocusedDate(state.lastCorrectDate);
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
            onBlur: props.onBlur,
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
            value: state.parsedDate,
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
