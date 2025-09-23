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
    PopupStyleProps,
    StyleProps,
    TextInputExtendProps,
    TextInputProps,
} from '../types';
import {filterDOMProps} from '../utils/filterDOMProps';

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
    const {inputProps, calendarProps, timeInputProps} = useRelativeDateFieldProps(state, props);

    const isMobile = useMobile();

    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

    const [isOpen, setOpen] = React.useState(false);
    const dialogClosing = React.useRef(false);

    const {focusWithinProps} = useFocusWithin({
        onFocusWithinChange: (isFocusWithin) => {
            if (!dialogClosing.current) {
                setOpen(isFocusWithin);
            }
        },
        isDisabled: isMobile,
    });

    const DOMProps = filterDOMProps(props);
    delete DOMProps.id;

    return (
        <div
            {...DOMProps}
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
                controlProps={{
                    ...inputProps.controlProps,
                    onClick: () => {
                        setOpen(true);
                    },
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
                    onOpenChange={(open) => {
                        if (!open) {
                            setOpen(false);
                        }
                        dialogClosing.current = !open;
                    }}
                    onTransitionOutComplete={() => {
                        setTimeout(() => {
                            dialogClosing.current = false;
                        });
                    }}
                    placement={props.popupPlacement}
                    offset={props.popupOffset}
                    className={props.popupClassName}
                    style={props.popupStyle}
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
