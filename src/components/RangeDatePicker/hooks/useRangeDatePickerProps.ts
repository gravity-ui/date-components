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
import type {RangeDatePickerProps} from '../RangeDatePicker';
import {i18n} from '../i18n';

import type {RangeDatePickerState} from './useRangeDatePickerState';

interface InnerRangeDatePickerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupProps: React.HTMLAttributes<unknown> & {ref: React.Ref<any>};
    fieldProps: TextInputProps;
    calendarButtonProps: ButtonProps & {ref: React.Ref<HTMLButtonElement>};
    popupProps: PopupProps;
    calendarProps: CalendarProps<RangeValue<DateTime>> & {ref: React.Ref<CalendarInstance>};
    timeInputProps: DateFieldProps<RangeValue<DateTime>>;
}

export function useRangeDatePickerProps(
    state: RangeDatePickerState,
    {onFocus, onBlur, ...props}: RangeDatePickerProps,
): InnerRangeDatePickerProps {
    const [isActive, setActive] = React.useState(false);
    if (!isActive && state.isOpen) {
        state.setOpen(false);
    }

    const [focusedDate, setFocusedDate] = React.useState(state.dateFieldState.displayValue.start);
    const [prevDateValue, setPrevDateValue] = React.useState(state.dateFieldState.displayValue);

    if (!state.dateFieldState.displayValue.start.isSame(prevDateValue.start, 'day')) {
        setPrevDateValue(state.dateFieldState.displayValue);
        setFocusedDate(state.dateFieldState.displayValue.start);
    } else if (!state.dateFieldState.displayValue.end.isSame(prevDateValue.end, 'day')) {
        setPrevDateValue(state.dateFieldState.displayValue);
        setFocusedDate(state.dateFieldState.displayValue.end);
    }

    const [prevOpen, setPrevOpen] = React.useState(state.isOpen);
    if (state.isOpen !== prevOpen) {
        setPrevOpen(state.isOpen);
        if (!state.isOpen) {
            // FIXME: use popup afterOpenChange instead.
            setTimeout(() => {
                setFocusedDate(state.dateFieldState.displayValue.start);
            }, 200);
        }
    }

    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
        onFocusWithinChange(isFocusWithin) {
            if (!isFocusWithin) {
                setActive(false);
            }
        },
    });

    const commonInputProps: TextInputProps = {
        onFocus: () => {
            if (!isActive) {
                setActive(true);
                state.setOpen(true);
            }
        },
    };

    const {inputProps} = useDateFieldProps(state.dateFieldState, props);

    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleRef = useForkRef(inputRef, inputProps.controlRef);

    const calendarRef = React.useRef<CalendarInstance>(null);
    const calendarButtonRef = React.useRef<HTMLButtonElement>(null);
    const groupRef = React.useRef<HTMLElement>(null);

    function focusCalendar() {
        setTimeout(() => {
            calendarRef.current?.focus();
        });
    }

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
                    focusCalendar();
                }
            },
        },
        fieldProps: mergeProps(
            commonInputProps,
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
                if (!state.isOpen) {
                    focusCalendar();
                }
            },
        },
        popupProps: {
            open: state.isOpen,
            onEscapeKeyDown: () => {
                state.setOpen(false);
                focusInput();
            },
        },
        calendarProps: {
            ref: calendarRef,
            size: props.size === 's' ? 'm' : props.size,
            disabled: props.disabled,
            readOnly: props.readOnly,
            onUpdate: (d) => {
                state.setDateValue(d);
                if (!state.hasTime) {
                    state.setOpen(false);
                    focusInput();
                }
            },
            value: state.value,
            focusedValue: focusedDate,
            onFocusUpdate: setFocusedDate,
            minValue: props.minValue,
            maxValue: props.maxValue,
            isDateUnavailable: props.isDateUnavailable,
            timeZone: state.timeZone,
        },
        timeInputProps: {
            value: state.timeValue,
            placeholderValue: state.dateFieldState.displayValue.start,
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
