import React from 'react';

import {
    type ButtonProps,
    type PopupProps,
    type TextInputProps,
    useForkRef,
} from '@gravity-ui/uikit';

import type {CalendarProps} from '../../Calendar';
import {type DateFieldProps, useDateFieldProps} from '../../DateField';
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
    calendarProps: CalendarProps;
    timeInputProps: DateFieldProps;
}

export function useRelativeDatePickerProps(
    state: RelativeDatePickerState,
    props: RelativeDatePickerProps,
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

    const commonInputProps: TextInputProps = {};

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

    return {
        groupProps: {
            role: 'group',
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
                if (wasActiveBeforeClickRef.current) {
                    setOpen(!isOpen);
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
