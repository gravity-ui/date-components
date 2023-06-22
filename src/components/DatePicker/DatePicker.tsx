import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useMobile} from '@gravity-ui/uikit';
import type {TextInputProps} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {DateField} from '../DateField';
import type {DateFieldProps} from '../DateField';

import {DesktopCalendar, DesktopCalendarButton} from './DesktopCalendar';
import {MobileCalendar, MobileCalendarIcon} from './MobileCalendar';
import {useDatePickerState} from './hooks/useDatePickerState';

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
    /** id applied to the input element */
    id?: string;
}

export function DatePicker({value, defaultValue, onUpdate, className, ...props}: DatePickerProps) {
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const state = useDatePickerState({
        ...props,
        value,
        defaultValue,
        onUpdate,
    });

    const [isMobile] = useMobile();

    return (
        <div ref={anchorRef} className={b(null, className)}>
            {isMobile ? (
                <MobileCalendar props={props} state={state} />
            ) : (
                <DesktopCalendar anchorRef={anchorRef} props={props} state={state} />
            )}
            <DateField
                {...props}
                className={b('field')}
                value={state.value}
                onUpdate={state.setValue}
                format={state.format}
                hasClear={!isMobile}
                rightContent={
                    isMobile ? (
                        <MobileCalendarIcon props={props} state={state} />
                    ) : (
                        <DesktopCalendarButton props={props} state={state} />
                    )
                }
            />
        </div>
    );
}
