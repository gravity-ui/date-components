'use client';

import React from 'react';

import {Popup, TextInput, useFocusWithin, useMobile} from '@gravity-ui/uikit';

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

    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

    const [isOpen, setOpen] = React.useState(false);

    const {focusWithinProps} = useFocusWithin({
        onFocusWithinChange: (isFocusWithin) => {
            setOpen(isFocusWithin);
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
                ref={setAnchor}
                onBlur={props.onBlur}
                onKeyDown={(e) => {
                    inputProps.onKeyDown?.(e);
                    if (
                        !e.defaultPrevented &&
                        e.altKey &&
                        (e.key === 'ArrowDown' || e.key === 'ArrowUp')
                    ) {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(true);
                    }
                }}
            />
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
                <Popup
                    anchorElement={anchor}
                    open={isOpen}
                    onOpenChange={(_open, _event, reason) => {
                        if (reason === 'escape-key') {
                            setOpen(false);
                        }
                    }}
                >
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
