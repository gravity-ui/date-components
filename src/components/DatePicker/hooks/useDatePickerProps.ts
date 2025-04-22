import React from 'react';

import {isDateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {useFocusWithin, useForkRef} from '@gravity-ui/uikit';
import type {ButtonButtonProps, PopupProps, TextInputProps} from '@gravity-ui/uikit';

import type {CalendarProps, CalendarRenderProps} from '../../Calendar';
import {useDateFieldProps} from '../../DateField';
import type {DateFieldProps} from '../../DateField';
import type {RangeValue} from '../../types';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import {mergeProps} from '../../utils/mergeProps';
import type {DatePickerProps} from '../DatePicker';
import {i18n} from '../i18n';
import {getCalendarModes, getDateTimeValue} from '../utils';

import type {DatePickerState} from './useDatePickerState';

interface InnerDatePickerProps<T = DateTime, RT = CalendarRenderProps> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupProps: React.HTMLAttributes<unknown> & {ref: React.Ref<any>};
    fieldProps: TextInputProps;
    calendarButtonProps: ButtonButtonProps & {ref: React.Ref<HTMLButtonElement>};
    popupProps: PopupProps;
    calendarProps: CalendarProps<T, RT> & {ref?: React.Ref<HTMLDivElement>};
    timeInputProps: DateFieldProps<T>;
}

export function useDatePickerProps<T extends DateTime | RangeValue<DateTime>, RT>(
    state: DatePickerState<T>,
    {onFocus, onBlur, ...props}: DatePickerProps<T, RT>,
): InnerDatePickerProps<T, RT> {
    const [isActive, setActive] = React.useState(false);

    const [focusedDate, setFocusedDate] = React.useState(
        isDateTime(state.dateFieldState.displayValue)
            ? state.dateFieldState.displayValue
            : state.dateFieldState.displayValue.start,
    );
    const [prevDateValue, setPrevDateValue] = React.useState<any>(
        state.dateFieldState.displayValue,
    );

    if (isDateTime(state.dateFieldState.displayValue)) {
        if (!state.dateFieldState.displayValue.isSame(prevDateValue, 'day')) {
            setPrevDateValue(state.dateFieldState.displayValue);
            setFocusedDate(state.dateFieldState.displayValue);
        }
    } else if (!state.dateFieldState.displayValue.start.isSame(prevDateValue.start, 'day')) {
        setPrevDateValue(state.dateFieldState.displayValue);
        setFocusedDate(state.dateFieldState.displayValue.start);
    } else if (!state.dateFieldState.displayValue.end.isSame(prevDateValue.end, 'day')) {
        setPrevDateValue(state.dateFieldState.displayValue);
        setFocusedDate(state.dateFieldState.displayValue.end);
    }

    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
        onFocusWithinChange(isFocusWithin) {
            setActive(isFocusWithin);
            if (!isFocusWithin) {
                state.setOpen(false, 'FocusOut');
            }
        },
    });

    const {inputProps} = useDateFieldProps(state.dateFieldState, props);

    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleRef = useForkRef(inputRef, inputProps.controlRef);

    const calendarButtonRef = React.useRef<HTMLButtonElement>(null);
    const groupRef = React.useRef<HTMLElement>(null);

    function focusInput() {
        setTimeout(() => {
            inputRef.current?.focus({preventScroll: true});
        });
    }

    const onlyTime = state.formatInfo.hasTime && !state.formatInfo.hasDate;
    const calendarModes = getCalendarModes(state.formatInfo);

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
                    state.setOpen(true, 'ShortcutKeyDown');
                }
            },
        },
        fieldProps: mergeProps(
            inputProps,
            state.dateFieldState.isEmpty && !isActive && props.placeholder
                ? {value: ''}
                : undefined,
            {
                controlRef: handleRef,
                controlProps: {role: 'combobox', 'aria-expanded': state.isOpen},
            },
        ),
        calendarButtonProps: {
            ref: calendarButtonRef,
            size: getButtonSizeForInput(props.size),
            disabled: state.disabled,
            'aria-label': i18n('Calendar'),
            'aria-haspopup': 'dialog',
            'aria-expanded': state.isOpen,
            view: 'flat-secondary',
            onClick: () => {
                setActive(true);
                state.setOpen(!state.isOpen, 'TriggerButtonClick');
            },
        },
        popupProps: {
            open: state.isOpen,
            onOpenChange: (open, e, reason) => {
                if (!open) {
                    if (reason === 'escape-key') {
                        state.setOpen(false, 'EscapeKeyDown');
                        focusInput();
                    } else if (reason === 'outside-press') {
                        if (!e?.target || !calendarButtonRef.current?.contains(e.target as Node)) {
                            state.setOpen(false, 'ClickOutside');
                        }

                        if (e?.target && groupRef.current?.contains(e.target as Node)) {
                            focusInput();
                        }
                    }
                }
            },
            onTransitionOutComplete: () => {
                setFocusedDate(
                    isDateTime(state.dateFieldState.displayValue)
                        ? state.dateFieldState.displayValue
                        : state.dateFieldState.displayValue.start,
                );
            },
            modal: !props.disableFocusTrap,
            returnFocus: !props.disableFocusTrap,
            disablePortal: props.disablePortal,
            placement: props.popupPlacement,
            offset: props.popupOffset,
            className: props.popupClassName,
            style: props.popupStyle,
        },
        calendarProps: {
            autoFocus: true,
            size: props.size === 's' ? 'm' : props.size,
            disabled: props.disabled,
            readOnly: props.readOnly,
            onUpdate: (d) => {
                state.setDateValue(d);
                if (!state.formatInfo.hasTime) {
                    focusInput();
                }
            },
            value: state.dateFieldState.displayValue,
            minValue: props.minValue,
            maxValue: props.maxValue,
            isDateUnavailable: props.isDateUnavailable,
            timeZone: state.timeZone,
            focusedValue: focusedDate,
            onFocusUpdate: setFocusedDate,
            modes: calendarModes,
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
