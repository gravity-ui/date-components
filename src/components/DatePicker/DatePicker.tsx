'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon, Clock as ClockIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput, useMobile} from '@gravity-ui/uikit';

import {Calendar} from '../Calendar';
import type {CalendarProps} from '../Calendar';
import {DateField} from '../DateField';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    InputDOMProps,
    KeyboardEvents,
    StyleProps,
    TextInputProps,
} from '../types';

import {MobileCalendar} from './MobileCalendar';
import {StubButton} from './StubButton';
import type {DatePickerStateOptions} from './hooks/datePickerStateFactory';
import {useDatePickerProps} from './hooks/useDatePickerProps';
import {useDatePickerState} from './hooks/useDatePickerState';
import {b} from './utils';

import './DatePicker.scss';

export interface DatePickerProps<T = DateTime>
    extends DatePickerStateOptions<T>,
        TextInputProps,
        FocusableProps,
        KeyboardEvents,
        DomProps,
        InputDOMProps,
        StyleProps,
        AccessibilityProps {
    children?: (props: CalendarProps<T>) => React.ReactNode;
    disablePortal?: boolean;
    disableFocusTrap?: boolean;
}

export function DatePicker({className, ...props}: DatePickerProps) {
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const state = useDatePickerState(props);

    const {groupProps, fieldProps, calendarButtonProps, popupProps, calendarProps, timeInputProps} =
        useDatePickerProps(state, props);

    const isMobile = useMobile();
    const isOnlyTime = state.formatInfo.hasTime && !state.formatInfo.hasDate;

    return (
        <div className={b(null, className)} {...groupProps}>
            {isMobile ? (
                <MobileCalendar props={props} state={state} />
            ) : (
                !isOnlyTime && (
                    <div ref={anchorRef} className={b('popup-anchor')}>
                        <Popup anchorRef={anchorRef} {...popupProps}>
                            <div className={b('popup-content')}>
                                {typeof props.children === 'function' ? (
                                    props.children(calendarProps)
                                ) : (
                                    <Calendar {...calendarProps} />
                                )}
                                {state.hasTime && (
                                    <div className={b('time-field-wrapper')}>
                                        <DateField {...timeInputProps} />
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </div>
                )
            )}
            <TextInput
                {...fieldProps}
                className={b('field', {mobile: isMobile})}
                hasClear={!isMobile && fieldProps.hasClear}
                endContent={
                    <React.Fragment>
                        {!isMobile && !isOnlyTime && (
                            <Button {...calendarButtonProps}>
                                <Icon data={CalendarIcon} />
                            </Button>
                        )}
                        {!isMobile && isOnlyTime && (
                            <StubButton size={calendarButtonProps.size} icon={ClockIcon} />
                        )}
                        {isMobile && (
                            <StubButton
                                size={calendarButtonProps.size}
                                icon={isOnlyTime ? ClockIcon : CalendarIcon}
                            />
                        )}
                    </React.Fragment>
                }
            />
            <HiddenInput
                name={props.name}
                value={state.value}
                toStringValue={(value) => value?.toISOString() ?? ''}
                onReset={(value) => {
                    state.setValue(value);
                }}
                disabled={state.disabled}
                form={props.form}
            />
        </div>
    );
}
