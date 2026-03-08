'use client';

import {Popup, TextInput, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {Calendar} from '../Calendar';
import {DateField} from '../DateField';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    InputDOMProps,
    KeyboardEvents,
    PopupStyleProps,
    StyleProps,
    TextInputExtendProps,
    TextInputProps,
} from '../types';

import {useRelativeDateFieldProps} from './hooks/useRelativeDateFieldProps';
import {useRelativeDateFieldState} from './hooks/useRelativeDateFieldState';
import type {RelativeDateFieldOptions} from './hooks/useRelativeDateFieldState';

import './RelativeDateField.scss';

const b = block('relative-date-field');

export interface RelativeDateFieldProps
    extends
        RelativeDateFieldOptions,
        TextInputProps,
        TextInputExtendProps,
        DomProps,
        InputDOMProps,
        StyleProps,
        AccessibilityProps,
        FocusableProps,
        KeyboardEvents,
        PopupStyleProps {
    /**
     * Show time field in popup
     * @default false
     */
    hasTime?: boolean;
}
export function RelativeDateField(props: RelativeDateFieldProps) {
    const state = useRelativeDateFieldState(props);
    const {groupProps, inputProps, popupProps, calendarProps, timeInputProps} =
        useRelativeDateFieldProps(state, props);

    const isMobile = useMobile();

    return (
        <div {...groupProps} role="group" className={b(null, props.className)} style={props.style}>
            <TextInput {...inputProps} className={b('field')} />
            <HiddenInput
                name={props.name}
                value={state.value}
                onReset={(value) => {
                    state.setValue(value);
                }}
                disabled={state.disabled}
                form={props.form}
            />
            {!isMobile && (
                <Popup {...popupProps} className={props.popupClassName} style={props.popupStyle}>
                    <div className={b('popup-content')}>
                        <Calendar {...calendarProps} />
                        {props.hasTime ? (
                            <div className={b('time-field-wrapper')}>
                                <DateField className={b('time-field')} {...timeInputProps} />
                            </div>
                        ) : null}
                    </div>
                </Popup>
            )}
        </div>
    );
}
