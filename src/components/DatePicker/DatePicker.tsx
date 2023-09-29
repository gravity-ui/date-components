import React from 'react';

import {TextInput, useFocusWithin, useMobile} from '@gravity-ui/uikit';

import {useDateFieldProps, useDateFieldState} from '../DateField/index.js';
import type {
    AccessibilityProps,
    DateFieldBase,
    DomProps,
    FocusableProps,
    KeyboardEvents,
    StyleProps,
    TextInputProps,
} from '../types/index.js';

import {DesktopCalendar, DesktopCalendarButton} from './DesktopCalendar.js';
import {MobileCalendar, MobileCalendarIcon} from './MobileCalendar.js';
import {useDatePickerState} from './hooks/useDatePickerState.js';
import {b} from './utils.js';

import './DatePicker.scss';

export interface DatePickerProps
    extends DateFieldBase,
        TextInputProps,
        FocusableProps,
        KeyboardEvents,
        DomProps,
        StyleProps,
        AccessibilityProps {}

export function DatePicker({
    value,
    defaultValue,
    onUpdate,
    className,
    onFocus,
    onBlur,
    ...props
}: DatePickerProps) {
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const state = useDatePickerState({
        ...props,
        value,
        defaultValue,
        onUpdate,
    });

    const [isMobile] = useMobile();

    const [isActive, setActive] = React.useState(false);
    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
        onFocusWithinChange(isFocusWithin) {
            setActive(isFocusWithin);
        },
    });

    const fieldState = useDateFieldState({
        value: state.value,
        onUpdate: state.setValue,
        disabled: state.disabled,
        readOnly: state.readOnly,
        validationState: props.validationState,
        minValue: props.minValue,
        maxValue: props.maxValue,
        isDateUnavailable: props.isDateUnavailable,
        format: state.format,
        placeholderValue: props.placeholderValue,
        timeZone: props.timeZone,
    });

    const {inputProps} = useDateFieldProps(fieldState, props);

    return (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
            ref={anchorRef}
            className={b(null, className)}
            style={props.style}
            {...focusWithinProps}
            role="group"
            aria-disabled={state.disabled || undefined}
            onKeyDown={(e) => {
                if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    e.preventDefault();
                    e.stopPropagation();
                    state.setOpen(true);
                }
            }}
        >
            {isMobile ? (
                <MobileCalendar props={props} state={state} />
            ) : (
                <DesktopCalendar anchorRef={anchorRef} props={props} state={state} />
            )}
            <TextInput
                {...inputProps}
                value={fieldState.isEmpty && !isActive && props.placeholder ? '' : inputProps.value}
                className={b('field', {mobile: isMobile})}
                hasClear={!isMobile && inputProps.hasClear}
                rightContent={
                    isMobile ? (
                        <MobileCalendarIcon props={props} state={state} />
                    ) : (
                        <DesktopCalendarButton props={props} state={state} />
                    )
                }
            />
        </div>
    );
}
