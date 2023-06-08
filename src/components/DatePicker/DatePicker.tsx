import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, type TextInputProps, useOnFocusOutside} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {Calendar} from '../Calendar';
import {DateField} from '../DateField';
import type {DateFieldProps} from '../DateField';

import {useDatePickerState} from './hooks/useDatePickerState';
import {i18n} from './i18n';

import './DatePicker.scss';

const b = block('date-picker');

export interface DatePickerProps {
    /** The current value (controlled). */
    value?: DateTime | null;
    /** The default value (uncontrolled). */
    defaultValue?: DateTime;
    /** Handler that is called when the value changes. */
    onUpdate?: (date: DateTime | null) => void;
    placeholderValue?: DateTime;
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
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
    /** If true, the main element is focused during the first mount. */
    autoFocus?: boolean;
    size?: DateFieldProps['size'];
    /** Format of the date when rendered in the input. */
    format?: string;
    /** Format of the time when rendered in the input in popup. */
    timeFormat?: string;
    timeZone?: string;
    /**
     * Show clear button
     * @default false
     */
    hasClear?: boolean;
    /** Validation error */
    error?: TextInputProps['error'];
    /** Class name applied to the root element. */
    className?: string;
}

export function DatePicker({
    value,
    defaultValue,
    onUpdate,
    timeFormat,
    className,
    ...props
}: DatePickerProps) {
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const popupContentRef = React.useRef<HTMLDivElement>(null);

    const hasTime = Boolean(timeFormat);
    const state = useDatePickerState({
        ...props,
        value,
        defaultValue,
        onUpdate,
        hasTime,
    });

    const {onFocus, onBlur} = useOnFocusOutside({
        onFocusOutside: () => {
            state.setOpen(false);
        },
        enabled: state.isOpen,
    });

    return (
        <div ref={anchorRef} className={b(null, className)}>
            <DateField
                className={b('field')}
                value={state.value}
                onUpdate={state.setValue}
                {...props}
                rightContent={
                    <Button
                        view="flat"
                        size={getButtonSize(props.size)}
                        disabled={props.disabled}
                        extraProps={{'aria-label': i18n('Open calendar')}}
                        onClick={() => {
                            state.setOpen(true);
                        }}
                    >
                        <Icon data={CalendarIcon} />
                    </Button>
                }
            />
            <Popup
                open={state.isOpen}
                anchorRef={anchorRef}
                onClose={() => {
                    state.setOpen(false);
                }}
                restoreFocus
            >
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                <div
                    ref={popupContentRef}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className={b('popup-content')}
                    tabIndex={-1}
                    onClick={() => {
                        if (!popupContentRef.current) {
                            return;
                        }
                        if (!popupContentRef.current.contains(document.activeElement)) {
                            popupContentRef.current.focus();
                        }
                    }}
                >
                    <Calendar
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        size={props.size === 's' ? 'm' : props.size}
                        disabled={props.disabled}
                        readOnly={props.readOnly}
                        onUpdate={(d) => {
                            state.setDateValue(d);
                        }}
                        defaultFocusedValue={state.dateValue ?? undefined}
                        value={state.dateValue}
                        minValue={props.minValue}
                        maxValue={props.maxValue}
                        timeZone={props.timeZone}
                    />
                    {hasTime && state.isOpen && (
                        <div className={b('time-field-wrapper')}>
                            <DateField
                                className={b('time-field')}
                                size={props.size}
                                readOnly={props.readOnly}
                                value={state.timeValue}
                                onUpdate={state.setTimeValue}
                                placeholderValue={props.placeholderValue}
                                minValue={props.minValue}
                                maxValue={props.maxValue}
                                timeZone={props.timeZone}
                                format={timeFormat}
                            />
                        </div>
                    )}
                </div>
            </Popup>
        </div>
    );
}

function getButtonSize(size: DateFieldProps['size']) {
    switch (size) {
        case 'xl': {
            return 'l';
        }
        case 'l': {
            return 'm';
        }
        case 's': {
            return 'xs';
        }
        default: {
            return 's';
        }
    }
}
