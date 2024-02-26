import React from 'react';

import {Calendar as CalendarIcon, Function as FunctionIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {Calendar} from '../Calendar';
import type {CalendarProps} from '../Calendar';
import {DateField} from '../DateField';
import {MobileCalendar, MobileCalendarIcon} from '../DatePicker/MobileCalendar';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    InputDOMProps,
    KeyboardEvents,
    StyleProps,
    TextInputProps,
} from '../types';

import {useRelativeDatePickerProps} from './hooks/useRelativeDatePickerProps';
import {useRelativeDatePickerState} from './hooks/useRelativeDatePickerState';
import type {RelativeDatePickerStateOptions, Value} from './hooks/useRelativeDatePickerState';

import './RelativeDatePicker.scss';

const b = block('relative-date-picker');

export interface RelativeDatePickerProps
    extends RelativeDatePickerStateOptions,
        TextInputProps,
        FocusableProps,
        KeyboardEvents,
        DomProps,
        InputDOMProps,
        StyleProps,
        AccessibilityProps {
    children?: (props: CalendarProps) => React.ReactNode;
}

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

    const isMobile = useMobile();

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
                controlProps={{
                    ...fieldProps.controlProps,
                    disabled: isMobile && state.mode === 'absolute',
                    className: b('input', {mobile: isMobile && state.mode === 'absolute'}),
                }}
                hasClear={props.hasClear && !(isMobile && state.mode === 'absolute')}
                startContent={
                    <Button {...modeSwitcherProps}>
                        <Icon data={FunctionIcon} />
                    </Button>
                }
                endContent={
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
            <input
                type="text"
                hidden
                name={props.name}
                value={getNativeValue(state.value)}
                // Ignore React warning
                onChange={() => {}}
            />
            {!isMobile && (
                <Popup {...popupProps} anchorRef={anchorRef}>
                    <div className={b('popup-content')}>
                        {typeof props.children === 'function' ? (
                            props.children(calendarProps)
                        ) : (
                            <Calendar {...calendarProps} />
                        )}
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

function getNativeValue(value: Value | null) {
    if (!value) {
        return '';
    }
    if (value.type === 'relative') {
        return value.value;
    }
    return value.value.toISOString();
}
