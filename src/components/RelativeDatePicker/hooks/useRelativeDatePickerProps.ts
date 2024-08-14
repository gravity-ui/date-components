import React from 'react';

import {useControlledState, useFocusWithin, useForkRef} from '@gravity-ui/uikit';
import type {ButtonProps, PopupProps, TextInputProps} from '@gravity-ui/uikit';

import type {Calendar, CalendarInstance} from '../../Calendar';
import {useDateFieldProps} from '../../DateField';
import type {DateFieldProps} from '../../DateField';
import {useRelativeDateFieldProps} from '../../RelativeDateField';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import {mergeProps} from '../../utils/mergeProps';
import type {RelativeDatePickerProps} from '../RelativeDatePicker';
import {i18n} from '../i18n';

import type {RelativeDatePickerState} from './useRelativeDatePickerState';

interface InnerRelativeDatePickerProps {
    groupProps: React.HTMLAttributes<unknown> & {ref: React.Ref<HTMLElement>};
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
    const {mode, setMode, datePickerState, relativeDateState} = state;

    const [focusedDate, setFocusedDate] = React.useState(
        mode === 'relative'
            ? relativeDateState.lastCorrectDate
            : datePickerState.dateFieldState.displayValue,
    );

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

    const [isOpen, setOpen] = useControlledState<boolean>(undefined, false, props.onOpenChange);
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
        errorMessage: props.errorMessage,
        errorPlacement: props.errorPlacement,
        controlProps: {
            onClick: () => {
                if (state.disabled) {
                    return;
                }
                if (!isOpen) {
                    state.setActive(true);
                    setOpen(true);
                }
            },
            role: 'combobox',
            'aria-expanded': isOpen,
        },
    };

    const {inputProps} = useDateFieldProps(datePickerState.dateFieldState, {
        ...props,
        value: undefined,
        defaultValue: undefined,
        onUpdate: undefined,
    });

    const {inputProps: relativeDateProps} = useRelativeDateFieldProps(relativeDateState, {
        ...props,
        value: undefined,
        defaultValue: undefined,
        onUpdate: undefined,
    });

    let validationState = props.validationState;
    if (!validationState) {
        validationState =
            mode === 'relative'
                ? relativeDateState.validationState
                : datePickerState.dateFieldState.validationState;
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
            inputRef.current?.focus({preventScroll: true});
        });
    }
    const groupRef = React.useRef<HTMLElement>(null);

    return {
        groupProps: {
            ref: groupRef,
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
            mode === 'absolute' &&
                datePickerState.dateFieldState.isEmpty &&
                !state.isActive &&
                props.placeholder
                ? {value: ''}
                : undefined,
            {controlRef: handleRef, validationState},
        ),
        modeSwitcherProps: {
            size: getButtonSizeForInput(props.size),
            disabled: state.readOnly || state.disabled,
            view: 'flat-secondary',
            style: {zIndex: 2, marginInlineEnd: 2},
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
            onOutsideClick: (e) => {
                if (e.target && !groupRef.current?.contains(e.target as Node)) {
                    setOpen(false);
                }
            },
            onTransitionExited: () => {
                setFocusedDate(
                    mode === 'relative'
                        ? relativeDateState.lastCorrectDate
                        : datePickerState.dateFieldState.displayValue,
                );
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
