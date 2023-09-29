import React from 'react';

import type {TextInputProps} from '@gravity-ui/uikit';

import type {CalendarProps} from '../../Calendar/index.js';
import type {DateFieldProps} from '../../DateField/index.js';
import type {RelativeDateFieldProps} from '../RelativeDateField.js';

import type {RelativeDateFieldState} from './useRelativeDateFieldState.js';

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

    let error: React.ReactNode;
    if (props.validationState === 'invalid') {
        error = props.errorMessage || true;
    } else {
        error = state.validationState === 'invalid';
    }

    return {
        inputProps: {
            size: props.size,
            autoFocus: props.autoFocus,
            value: state.text,
            onUpdate: state.setText,
            disabled: state.disabled,
            hasClear: props.hasClear,
            //@ts-expect-error TODO: use new TextInput API
            error,
            label: props.label,
            id: props.id,
            leftContent: props.leftContent,
            rightContent: props.rightContent,
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
