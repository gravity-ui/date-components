'use client';

import React from 'react';

import {Popup, TextInput, useFocusWithin, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {Calendar} from '../Calendar';
import {DateField} from '../DateField';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    InputDOMProps,
    KeyboardEvents,
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
    extends RelativeDateFieldOptions,
        TextInputProps,
        TextInputExtendProps,
        DomProps,
        InputDOMProps,
        StyleProps,
        AccessibilityProps,
        FocusableProps,
        KeyboardEvents {
    /**
     * Show time field in popup
     * @default false
     */
    hasTime?: boolean;
}
export function RelativeDateField(props: RelativeDateFieldProps) {
    const state = useRelativeDateFieldState(props);
    const {inputProps, calendarProps, timeInputProps} = useRelativeDateFieldProps(state, props);

    const isMobile = useMobile();

    const anchorRef = React.useRef<HTMLElement>(null);

    const [isOpen, setOpen] = React.useState(false);

    const {focusWithinProps} = useFocusWithin({
        onBlurWithin: () => {
            setOpen(false);
        },
        isDisabled: isMobile,
    });

    return (
        <div
            role="group"
            className={b(null, props.className)}
            style={props.style}
            {...focusWithinProps}
        >
            <TextInput
                {...inputProps}
                className={b('field')}
                ref={anchorRef}
                onFocus={(e) => {
                    if (!isMobile) {
                        setOpen(true);
                    }
                    props.onFocus?.(e);
                }}
                onBlur={props.onBlur}
            />
            <input
                type="text"
                hidden
                name={props.name}
                value={state.value ?? ''}
                // Ignore React warning
                onChange={() => {}}
            />
            {!isMobile && (
                <Popup anchorRef={anchorRef} open={isOpen}>
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
