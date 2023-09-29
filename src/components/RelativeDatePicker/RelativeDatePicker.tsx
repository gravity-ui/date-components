import React from 'react';

import {Calendar as CalendarIcon, Function as FunctionIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn.js';
import {Calendar} from '../Calendar/index.js';
import {DateField} from '../DateField/index.js';
import {MobileCalendar, MobileCalendarIcon} from '../DatePicker/MobileCalendar.js';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    KeyboardEvents,
    StyleProps,
    TextInputProps,
} from '../types/index.js';

import {useRelativeDatePickerProps} from './hooks/useRelativeDatePickerProps.js';
import {useRelativeDatePickerState} from './hooks/useRelativeDatePickerState.js';
import type {RelativeDatePickerStateOptions} from './hooks/useRelativeDatePickerState.js';

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

export function RelativeDatePicker(props: RelativeDatePickerProps) {
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

    const [isMobile] = useMobile();

    return (
        <div ref={anchorRef} className={b(null, props.className)} {...groupProps}>
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
