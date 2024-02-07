import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useFocusWithin, useForkRef} from '@gravity-ui/uikit';
import type {ButtonProps, PopupProps, TextInputProps} from '@gravity-ui/uikit';

import type {CalendarInstance, CalendarProps} from '../../Calendar';
import {useDateFieldProps} from '../../DateField';
import type {DateFieldProps} from '../../DateField';
import type {RangeValue} from '../../types';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import {mergeProps} from '../../utils/mergeProps';
import type {DatePickerProps} from '../DatePicker';
import {i18n} from '../i18n';
import {getDateTimeValue} from '../utils';

import type {DatePickerState} from './useDatePickerState';

interface InnerRelativeDatePickerProps<T = DateTime> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupProps: React.HTMLAttributes<unknown> & {ref: React.Ref<any>};
    fieldProps: TextInputProps;
    calendarButtonProps: ButtonProps & {ref: React.Ref<HTMLButtonElement>};
    popupProps: PopupProps;
    calendarProps: CalendarProps<T> & {ref: React.Ref<CalendarInstance>};
    timeInputProps: DateFieldProps<T>;
}

export function useDatePickerProps<T extends DateTime | RangeValue<DateTime>>(
    state: DatePickerState<T>,
    {onFocus, onBlur, ...props}: DatePickerProps<T>,
): InnerRelativeDatePickerProps<T> {
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

    const onlyTime = state.hasTime && !state.hasDate;

    return {
        groupProps: {
            ref: groupRef,
            tabIndex: -1,
            role: 'group',
            ...focusWithinProps,
            style: props.style,
            'aria-disabled': state.disabled || undefined,
            onKeyDown: (e) => {
                if (!onlyTime && e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
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
            {controlRef: handleRef},
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
            value: state.dateFieldState.displayValue,
            minValue: props.minValue,
            maxValue: props.maxValue,
            isDateUnavailable: props.isDateUnavailable,
            timeZone: state.timeZone,
        },
        timeInputProps: {
            value: state.timeValue,
            placeholderValue: getDateTimeValue(state.dateFieldState.displayValue),
            onUpdate: state.setTimeValue,
            format: state.timeFormat,
            readOnly: state.readOnly,
            disabled: state.disabled,
            timeZone: state.timeZone,
            hasClear: props.hasClear,
            size: props.size,
        },
    };
}
