import React from 'react';

import {Calendar as CalendarIcon, Function as FunctionIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput, useFocusWithin, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {Calendar} from '../Calendar';
import {DateField} from '../DateField';
import {MobileCalendar, MobileCalendarIcon} from '../DatePicker/MobileCalendar';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    KeyboardEvents,
    StyleProps,
    TextInputProps,
} from '../types';

import {useRelativeDatePickerProps} from './hooks/useRelativeDatePickerProps';
import {useRelativeDatePickerState} from './hooks/useRelativeDatePickerState';
import type {RelativeDatePickerStateOptions} from './hooks/useRelativeDatePickerState';

import './RelativeDatePicker.scss';

const b = block('relative-date-picker');

export interface RelativeDatePickerProps
    extends RelativeDatePickerStateOptions,
        TextInputProps,
        FocusableProps,
        KeyboardEvents,
        DomProps,
        StyleProps,
        AccessibilityProps {}

export function RelativeDatePicker({onFocus, onBlur, ...props}: RelativeDatePickerProps) {
    const state = useRelativeDatePickerState(props);

    const {
        groupProps,
        fieldProps,
        modeSwitcherProps,
        calendarButtonProps,
        popupProps,
        calendarProps,
        timeInputProps,
    } = useRelativeDatePickerProps(state, props);

    const anchorRef = React.useRef<HTMLDivElement>(null);

    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
        onFocusWithinChange(isFocusWithin) {
            state.setActive(isFocusWithin);
        },
    });

    const [isMobile] = useMobile();

    return (
        <div
            ref={anchorRef}
            className={b(null, props.className)}
            {...groupProps}
            {...focusWithinProps}
        >
            {isMobile && state.mode === 'absolute' && (
                <MobileCalendar
                    state={state.datePickerState}
                    props={{
                        id: props.id,
                        disabled: props.disabled,
                        readOnly: props.readOnly,
                        placeholderValue: props.placeholderValue,
                        timeZone: props.timeZone,
                    }}
                />
            )}
            <TextInput
                {...fieldProps}
                leftContent={
                    <Button {...modeSwitcherProps}>
                        <Icon data={FunctionIcon} />
                    </Button>
                }
                rightContent={
                    <React.Fragment>
                        {!isMobile && (
                            <Button {...calendarButtonProps}>
                                <Icon data={CalendarIcon} />
                            </Button>
                        )}
                        {isMobile && state.mode === 'absolute' && (
                            <MobileCalendarIcon
                                state={state.datePickerState}
                                props={{size: props.size}}
                            />
                        )}
                    </React.Fragment>
                }
            />
            {!isMobile && (
                <Popup {...popupProps} anchorRef={anchorRef}>
                    <div className={b('popup-content')}>
                        <Calendar {...calendarProps} />
                        {state.datePickerState.hasTime && (
                            <div className={b('time-field-wrapper')}>
                                <DateField {...timeInputProps} />
                            </div>
                        )}
                    </div>
                </Popup>
            )}
        </div>
    );
}
