import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput, useMobile} from '@gravity-ui/uikit';

import {Calendar, type CalendarProps} from '../Calendar';
import {DateField} from '../DateField';
import type {
    AccessibilityProps,
    DateFieldBase,
    DomProps,
    FocusableProps,
    KeyboardEvents,
    StyleProps,
    TextInputProps,
} from '../types';

import {MobileCalendar, MobileCalendarIcon} from './MobileCalendar';
import {useDatePickerProps} from './hooks/useDatePickerProps';
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

export function DatePicker({value, defaultValue, onUpdate, className, ...props}: DatePickerProps) {
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const state = useDatePickerState({
        ...props,
        value,
        defaultValue,
        onUpdate,
    });

    const {groupProps, fieldProps, calendarButtonProps, popupProps, calendarProps, timeInputProps} =
        useDatePickerProps(state, props);

    const isMobile = useMobile();

    return (
        <div className={b(null, className)} {...groupProps}>
            {isMobile ? (
                <MobileCalendar props={props} state={state} />
            ) : (
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
            )}
            <TextInput
                {...fieldProps}
                className={b('field', {mobile: isMobile})}
                hasClear={!isMobile && fieldProps.hasClear}
                endContent={
                    isMobile ? (
                        <MobileCalendarIcon props={props} state={state} />
                    ) : (
                        <Button {...calendarButtonProps}>
                            <Icon data={CalendarIcon} />
                        </Button>
                    )
                }
            />
        </div>
    );
}
