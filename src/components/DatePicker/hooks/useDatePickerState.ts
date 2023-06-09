import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {createPlaceholderValue, splitFormatIntoSections} from '../../DateField/utils';
import {useControlledState} from '../../hooks/useControlledState';
export type Granularity = 'day' | 'hour' | 'minute' | 'second';

export interface DatePickerState {
    /** The currently selected date. */
    value: DateTime | null;
    /** Sets the selected date. */
    setValue(value: DateTime | null): void;
    /**
     * The date portion of the value. This may be set prior to `value` if the user has
     * selected a date but has not yet selected a time.
     */
    dateValue: DateTime | null;
    /** Sets the date portion of the value. */
    setDateValue(value: DateTime): void;
    /**
     * The time portion of the value. This may be set prior to `value` if the user has
     * selected a time but has not yet selected a date.
     */
    timeValue: DateTime | null;
    /** Sets the time portion of the value. */
    setTimeValue(value: DateTime | null): void;
    /** Format of the date when rendered in the input. */
    format: string;
    /** Whether the date picker supports selecting a date. */
    hasDate: boolean;
    /** Whether the date picker supports selecting a time. */
    hasTime: boolean;
    /** Format of the time when rendered in the input. */
    timeFormat?: string;
    /** Whether the calendar popover is currently open. */
    isOpen: boolean;
    /** Sets whether the calendar popover is open. */
    setOpen(isOpen: boolean): void;
}

export interface DatePickerStateOptions {
    value?: DateTime | null;
    defaultValue?: DateTime;
    onUpdate?: (value: DateTime | null) => void;
    placeholderValue?: DateTime;
    timeZone?: string;
    format?: string;
    timeFormat?: string;
}

export function useDatePickerState(props: DatePickerStateOptions): DatePickerState {
    const [isOpen, setOpen] = React.useState(false);

    const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onUpdate);
    const [selectedDateInner, setSelectedDate] = React.useState<DateTime | null>(null);
    const [selectedTimeInner, setSelectedTime] = React.useState<DateTime | null>(null);

    let selectedDate = selectedDateInner;
    let selectedTime = selectedTimeInner;

    const format = props.format || 'L';
    const {hasDate, hasTime, timeFormat} = React.useMemo(() => {
        const sections = splitFormatIntoSections(format);
        let hasDate = false;
        let hasHours = false;
        let hasMinutes = false;
        let hasSeconds = false;
        for (const s of sections) {
            hasHours ||= s.type === 'hour';
            hasMinutes ||= s.type === 'minute';
            hasSeconds ||= s.type === 'second';
            hasDate ||= ['day', 'month', 'year'].includes(s.type);
        }
        return {
            hasTime: hasHours || hasMinutes || hasSeconds,
            timeFormat: hasSeconds ? 'LTS' : 'LT',
            hasDate,
        };
    }, [format]);

    if (value) {
        selectedDate = value;
        if (hasTime) {
            selectedTime = value;
        }
    }

    const commitValue = (date: DateTime, time: DateTime) => {
        setValue(mergeDateTime(date, time));
        setSelectedDate(null);
        setSelectedTime(null);
    };

    // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
    const selectDate = (newValue: DateTime) => {
        const shouldClose = !hasTime;
        if (hasTime) {
            if (selectedTime || shouldClose) {
                commitValue(
                    newValue,
                    selectedTime || getPlaceholderTime(props.placeholderValue, props.timeZone),
                );
            } else {
                setSelectedDate(newValue);
            }
        } else {
            setValue(newValue);
        }

        if (shouldClose) {
            setOpen(false);
        }
    };

    const selectTime = (newValue: DateTime) => {
        if (selectedDate) {
            commitValue(selectedDate, newValue);
        } else {
            setSelectedTime(newValue);
        }
    };
    return {
        value: value ?? null,
        setValue,
        dateValue: selectedDate,
        timeValue: selectedTime,
        setDateValue: selectDate,
        setTimeValue: selectTime,
        format,
        hasDate,
        hasTime,
        timeFormat,
        isOpen,
        setOpen(newIsOpen) {
            if (!newIsOpen && !value && selectedDate && hasTime) {
                commitValue(
                    selectedDate,
                    selectedTime || getPlaceholderTime(props.placeholderValue, props.timeZone),
                );
            }

            setOpen(newIsOpen);
        },
    };
}

function mergeDateTime(date: DateTime, time: DateTime) {
    return date
        .set('hours', time.hour())
        .set('minutes', time.minute())
        .set('seconds', time.second());
}

function getPlaceholderTime(placeholderValue: DateTime | undefined, timeZone?: string) {
    return createPlaceholderValue({placeholderValue, timeZone});
}
