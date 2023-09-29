import React from 'react';

import {TextInput, useFocusWithin, useMobile} from '@gravity-ui/uikit';

import type {CalendarProps} from '../Calendar';
import {useDateFieldProps, useDateFieldState} from '../DateField';
import type {
    AccessibilityProps,
    DateFieldBase,
    DomProps,
    FocusableProps,
    KeyboardEvents,
    StyleProps,
    TextInputProps,
} from '../types';

import {DesktopCalendar, DesktopCalendarButton} from './DesktopCalendar';
import {MobileCalendar, MobileCalendarIcon} from './MobileCalendar';
import {useDatePickerState} from './hooks/useDatePickerState';
import {b} from './utils';

import './DatePicker.scss';

export interface DatePickerProps
    extends DateFieldBase,
        TextInputProps,
        FocusableProps,
        KeyboardEvents,
        DomProps,
        StyleProps,
        AccessibilityProps {
    children?: (props: CalendarProps) => React.ReactNode;
}

export function DatePicker({
    value,
    defaultValue,
    onUpdate,
    className,
    onFocus,
    onBlur,
    children,
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
                <DesktopCalendar
                    anchorRef={anchorRef}
                    props={props}
                    state={state}
                    renderCalendar={children}
                />
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
