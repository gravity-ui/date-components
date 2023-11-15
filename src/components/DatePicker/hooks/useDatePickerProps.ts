import React from 'react';

import {useFocusWithin, useForkRef} from '@gravity-ui/uikit';
import type {ButtonProps, PopupProps, TextInputProps} from '@gravity-ui/uikit';

import type {Calendar, CalendarInstance} from '../../Calendar';
import {useDateFieldProps} from '../../DateField';
import type {DateFieldProps} from '../../DateField';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import {mergeProps} from '../../utils/mergeProps';
import type {DatePickerProps} from '../DatePicker';
import {i18n} from '../i18n';

import type {DatePickerState} from './useDatePickerState';

interface InnerRelativeDatePickerProps {
    groupProps: React.HTMLAttributes<unknown> & {ref: React.Ref<any>};
    fieldProps: TextInputProps;
    calendarButtonProps: ButtonProps & {ref: React.Ref<HTMLButtonElement>};
    popupProps: PopupProps;
    calendarProps: React.ComponentProps<typeof Calendar>;
    timeInputProps: DateFieldProps;
}

export function useDatePickerProps(
    state: DatePickerState,
    {onFocus, onBlur, ...props}: DatePickerProps,
): InnerRelativeDatePickerProps {
    const [isActive, setActive] = React.useState(false);

    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
        onFocusWithinChange(isFocusWithin) {
            setActive(isFocusWithin);
            if (!isFocusWithin) {
                state.setOpen(false);
            }
        },
    });

    const {inputProps} = useDateFieldProps(state.dateFieldState, props);

    let error: string | boolean | undefined;
    let validationState = props.validationState;
    if (validationState) {
        error = validationState === 'invalid' ? (props.errorMessage as string) || true : undefined;
    } else {
        validationState = state.dateFieldState.validationState;
        error = validationState === 'invalid';
    }

    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleRef = useForkRef(inputRef, inputProps.controlRef);

    const calendarRef = React.useRef<CalendarInstance>(null);
    const calendarButtonRef = React.useRef<HTMLButtonElement>(null);
    const groupRef = React.useRef<HTMLElement>(null);

    function focusInput() {
        setTimeout(() => {
            inputRef.current?.focus();
        });
    }

    return {
        groupProps: {
            ref: groupRef,
            tabIndex: -1,
            role: 'group',
            ...focusWithinProps,
            style: props.style,
            'aria-disabled': state.disabled || undefined,
            onKeyDown: (e) => {
                if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    e.preventDefault();
                    e.stopPropagation();
                    state.setOpen(true);
                }
            },
        },
        fieldProps: mergeProps(
            inputProps,
            state.dateFieldState.isEmpty && !isActive && props.placeholder
                ? {value: ''}
                : undefined,
            {controlRef: handleRef, error},
        ),
        calendarButtonProps: {
            ref: calendarButtonRef,
            size: getButtonSizeForInput(props.size),
            disabled: state.disabled,
            extraProps: {
                'aria-label': i18n('Calendar'),
                'aria-haspopup': 'dialog',
                'aria-expanded': state.isOpen,
            },
            view: 'flat-secondary',
            onClick: () => {
                setActive(true);
                state.setOpen(!state.isOpen);
            },
        },
        popupProps: {
            open: state.isOpen,
            onEscapeKeyDown: () => {
                state.setOpen(false);
                focusInput();
            },
            onOutsideClick: (e) => {
                if (e.target !== calendarButtonRef.current) {
                    state.setOpen(false);
                }
                if (e.target && groupRef.current?.contains(e.target as Node)) {
                    focusInput();
                }
            },
            // @ts-expect-error focusTrap in popup was introduced in a newer version of uikit
            focusTrap: true,
        },
        calendarProps: {
            ref: calendarRef,
            autoFocus: true,
            size: props.size === 's' ? 'm' : props.size,
            disabled: props.disabled,
            readOnly: props.readOnly,
            onUpdate: (d) => {
                state.setDateValue(d);
                if (!state.hasTime) {
                    focusInput();
                }
            },
            defaultFocusedValue: state.dateValue ?? undefined,
            value: state.dateValue,
            minValue: props.minValue,
            maxValue: props.maxValue,
            isDateUnavailable: props.isDateUnavailable,
            timeZone: props.timeZone,
        },
        timeInputProps: {
            value: state.timeValue,
            onUpdate: state.setTimeValue,
            format: state.timeFormat,
            readOnly: state.readOnly,
            disabled: state.disabled,
            timeZone: props.timeZone,
            hasClear: props.hasClear,
            size: props.size,
        },
    };
}
