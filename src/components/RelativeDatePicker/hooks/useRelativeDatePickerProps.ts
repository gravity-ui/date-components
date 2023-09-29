import React from 'react';

import {useFocusWithin, useForkRef} from '@gravity-ui/uikit';
import type {ButtonProps, PopupProps, TextInputProps} from '@gravity-ui/uikit';

import type {Calendar, CalendarInstance} from '../../Calendar/index.js';
import {useDateFieldProps} from '../../DateField/index.js';
import type {DateFieldProps} from '../../DateField/index.js';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput.js';
import {mergeProps} from '../../utils/mergeProps.js';
import type {RelativeDatePickerProps} from '../RelativeDatePicker.js';
import {i18n} from '../i18n/index.js';

import type {RelativeDatePickerState} from './useRelativeDatePickerState.js';

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

    const [prevDateValue, setPrevDateValue] = React.useState(datePickerState.dateValue);
    if (datePickerState.dateValue !== prevDateValue) {
        setPrevDateValue(datePickerState.dateValue);
        if (datePickerState.dateValue) {
            setFocusedDate(datePickerState.dateValue);
        }
    }
    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
        onFocusWithinChange(isFocusWithin) {
            if (!isFocusWithin) {
                state.setActive(isFocusWithin);
            }
        },
    });

    const [isOpen, setOpen] = React.useState(false);
    if (!state.isActive && isOpen) {
        setOpen(false);
    }

    const [prevActive, setPrevActive] = React.useState(state.isActive);
    if (prevActive !== state.isActive) {
        setPrevActive(state.isActive);
        if (state.isActive && !isOpen) {
            setOpen(true);
        }
    }

    const commonInputProps: TextInputProps = {
        onFocus: () => {
            state.setActive(true);
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

    const wasActiveBeforeClickRef = React.useRef(state.isActive);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleRef = useForkRef(
        inputRef,
        mode === 'relative' ? relativeDateProps.controlRef : inputProps.controlRef,
    );

    const calendarRef = React.useRef<CalendarInstance>(null);

    return {
        groupProps: {
            role: 'group',
            ...focusWithinProps,
            onKeyDown: (e) => {
                if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(true);
                }
            },
        },
        fieldProps: mergeProps(
            commonInputProps,
            mode === 'relative' ? relativeDateProps : inputProps,
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
                setTimeout(() => inputRef.current?.focus());
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
            onFocus: () => {
                wasActiveBeforeClickRef.current = state.isActive;
            },
            onClick: () => {
                state.setActive(true);
                if (wasActiveBeforeClickRef.current) {
                    setOpen(!isOpen);
                    if (!isOpen) {
                        setTimeout(() => {
                            calendarRef.current?.focus();
                        });
                    }
                }
                wasActiveBeforeClickRef.current = state.isActive;
            },
        },
        popupProps: {
            open: isOpen,
            onEscapeKeyDown: () => {
                setOpen(false);
            },
            restoreFocus: true,
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
                    setTimeout(() => inputRef.current?.focus());
                }
            },
            focusedValue: focusedDate,
            onFocusUpdate: setFocusedDate,
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
