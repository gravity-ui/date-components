import React from 'react';

import {Popup, TextInput, useMobile, useOnFocusOutside} from '@gravity-ui/uikit';
import type {TextInputPin, TextInputProps, TextInputSize, TextInputView} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {Calendar} from '../Calendar';
import {DateField} from '../DateField';
import type {AccessibilityProps, FocusableProps} from '../types';

import {useRelativeDateFieldProps} from './hooks/useRelativeDateFieldProps';
import {useRelativeDateFieldState} from './hooks/useRelativeDateFieldState';

import './RelativeDateField.scss';

const b = block('relative-date-field');

export interface RelativeDateFieldProps extends AccessibilityProps, FocusableProps {
    /** The current value (controlled). */
    value?: string | null;
    /** The default value (uncontrolled). */
    defaultValue?: string;
    /** Handler that is called when the value changes. */
    onUpdate?: (value: string | null) => void;
    /**
     * Whether the field is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the calendar value is immutable.
     * @default false
     */
    readOnly?: boolean;
    /** The size of the element */
    size?: TextInputSize;
    /**
     * Show clear button
     * @default false
     */
    hasClear?: boolean;
    /** Validation error */
    error?: TextInputProps['error'];
    /**
     * Show time field in popup
     * @default false
     */
    hasTime?: boolean;
    /** Inner field label */
    label?: TextInputProps['label'];
    /**
     * Corner rounding
     * @default 'round-round'
     */
    pin?: TextInputPin;
    /** Text that appears in the field when it has no value set */
    placeholder?: string;
    /** Control view */
    view?: TextInputView;
    /** Class name applied to the root element. */
    className?: string;
    /**
     * User`s node rendered before label and input
     */
    leftContent?: TextInputProps['leftContent'];
    /**
     * User`s node rendered after input and clear button
     */
    rightContent?: TextInputProps['rightContent'];
}
export function RelativeDateField(props: RelativeDateFieldProps) {
    const state = useRelativeDateFieldState(props);
    const {inputProps, calendarProps, timeInputProps} = useRelativeDateFieldProps(state, props);

    const [isMobile] = useMobile();

    const anchorRef = React.useRef<HTMLElement>(null);

    const [isOpen, setOpen] = React.useState(false);

    const {onFocus, onBlur} = useOnFocusOutside({
        onFocusOutside: () => {
            setOpen(false);
        },
        enabled: isOpen && !isMobile,
    });

    return (
        <div className={b(null, props.className)} onFocus={onFocus} onBlur={onBlur}>
            <TextInput
                {...inputProps}
                className={b('field')}
                ref={anchorRef}
                onFocus={
                    isMobile
                        ? undefined
                        : () => {
                              setOpen(true);
                          }
                }
            />
            {!isMobile && (
                <Popup anchorRef={anchorRef} open={isOpen}>
                    <div className={b('popup-content')} tabIndex={-1}>
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
