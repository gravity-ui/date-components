import React from 'react';

import {useFocusWithin, useForkRef} from '@gravity-ui/uikit';
import type {ButtonProps, PopupProps, TextInputProps} from '@gravity-ui/uikit';

import type {Calendar, CalendarInstance} from '../../Calendar';
import {useDateFieldProps} from '../../DateField';
import type {DateFieldProps} from '../../DateField';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import {mergeProps} from '../../utils/mergeProps';
import type {RelativeDatePickerProps} from '../RelativeDatePicker';
import {i18n} from '../i18n';

import type {RelativeDatePickerState} from './useRelativeDatePickerState';

interface InnerRelativeDatePickerProps {
    groupProps: React.HTMLAttributes<unknown>;
    fieldProps: TextInputProps;
    modeSwitcherProps: ButtonProps;
    calendarButtonProps: ButtonProps;
    popupProps: PopupProps;
    calendarProps: React.ComponentProps<typeof Calendar>;
    timeInputProps: DateFieldProps;
}

export function useRelativeDatePickerProps(
    state: RelativeDatePickerState,
    {onFocus, onBlur, ...props}: RelativeDatePickerProps,
): InnerRelativeDatePickerProps {
    const {mode, setMode, datePickerState, dateFieldState, relativeDateState} = state;

    const [focusedDate, setFocusedDate] = React.useState(relativeDateState.lastCorrectDate);

    const [prevCorrectDate, setPrevCorrectDate] = React.useState(relativeDateState.lastCorrectDate);
    if (prevCorrectDate !== relativeDateState.lastCorrectDate) {
        setPrevCorrectDate(relativeDateState.lastCorrectDate);
        setFocusedDate(relativeDateState.lastCorrectDate);
    }

    const [prevDateValue, setPrevDateValue] = React.useState(
        datePickerState.dateFieldState.displayValue,
    );
    if (!datePickerState.dateFieldState.displayValue.isSame(prevDateValue, 'day')) {
        setPrevDateValue(datePickerState.dateFieldState.displayValue);
        setFocusedDate(datePickerState.dateFieldState.displayValue);
    }
    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
        onFocusWithinChange(isFocusWithin) {
            if (!isFocusWithin) {
                state.setActive(false);
            }
        },
    });

    const [isOpen, setOpen] = React.useState(false);
    if (!state.isActive && isOpen) {
        setOpen(false);
    }

    const commonInputProps: TextInputProps = {
        onFocus: () => {
            if (!state.isActive) {
                state.setActive(true);
                setOpen(true);
            }
        },
    };

    const {inputProps} = useDateFieldProps(dateFieldState, {
        ...props,
        value: undefined,
        defaultValue: undefined,
        onUpdate: undefined,
    });

    const relativeDateProps: TextInputProps = {
        disabled: relativeDateState.disabled,
        value: relativeDateState.text,
        onUpdate: relativeDateState.setText,
        hasClear: props.hasClear && !relativeDateState.readOnly,
        placeholder: props.placeholder,
        size: props.size,
    };

    let error: string | boolean | undefined;
    let validationState = props.validationState;
    if (validationState) {
        error = validationState === 'invalid' ? (props.errorMessage as string) || true : undefined;
    } else {
        validationState =
            mode === 'relative'
                ? relativeDateState.validationState
                : dateFieldState.validationState;
        error = validationState === 'invalid';
    }

    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleRef = useForkRef(
        inputRef,
        mode === 'relative' ? relativeDateProps.controlRef : inputProps.controlRef,
    );

    const calendarRef = React.useRef<CalendarInstance>(null);

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

    return {
        groupProps: {
            tabIndex: -1,
            role: 'group',
            ...focusWithinProps,
            onKeyDown: (e) => {
                if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(true);
                    focusCalendar();
                }
            },
        },
        fieldProps: mergeProps(
            commonInputProps,
            mode === 'relative' ? relativeDateProps : inputProps,
            mode === 'absolute' && dateFieldState.isEmpty && !state.isActive && props.placeholder
                ? {value: ''}
                : undefined,
            {controlRef: handleRef, error},
        ),
        modeSwitcherProps: {
            size: getButtonSizeForInput(props.size),
            disabled: state.readOnly || state.disabled,
            view: 'flat-secondary',
            style: {zIndex: 2},
            selected: mode === 'relative',
            extraProps: {
                'aria-label': i18n('Formula input mode'),
            },
            onClick: () => {
                setMode(mode === 'relative' ? 'absolute' : 'relative');
                if (mode === 'relative') {
                    const valueDate = datePickerState.value;
                    if (valueDate) {
                        setFocusedDate(valueDate);
                    }
                } else if (relativeDateState.parsedDate) {
                    setFocusedDate(relativeDateState.parsedDate);
                }
                focusInput();
            },
        },
        calendarButtonProps: {
            size: getButtonSizeForInput(props.size),
            disabled: state.disabled,
            extraProps: {
                'aria-label': i18n('Calendar'),
                'aria-haspopup': 'dialog',
                'aria-expanded': isOpen,
            },
            view: 'flat-secondary',
            onClick: () => {
                state.setActive(true);
                setOpen(!isOpen);
                if (!isOpen) {
                    focusCalendar();
                }
            },
        },
        popupProps: {
            open: isOpen,
            onEscapeKeyDown: () => {
                setOpen(false);
                focusInput();
            },
        },
        calendarProps: {
            ref: calendarRef,
            size: props.size === 's' ? 'm' : props.size,
            readOnly: props.readOnly,
            value: state.selectedDate,
            onUpdate: (v) => {
                datePickerState.setDateValue(v);
                if (!state.datePickerState.hasTime) {
                    setOpen(false);
                    focusInput();
                }
            },
            focusedValue: focusedDate,
            onFocusUpdate: setFocusedDate,
            minValue: props.minValue,
            maxValue: props.maxValue,
        },
        timeInputProps: {
            value: datePickerState.timeValue,
            onUpdate: datePickerState.setTimeValue,
            format: datePickerState.timeFormat,
            readOnly: state.readOnly,
            disabled: state.disabled,
            timeZone: props.timeZone,
            hasClear: props.hasClear,
            size: props.size,
        },
    };
}
