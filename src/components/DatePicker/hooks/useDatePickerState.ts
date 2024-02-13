import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {useDateFieldState} from '../../DateField';
import type {DateFieldState} from '../../DateField';
import {useControlledState} from '../../hooks/useControlledState';
import type {DateFieldBase} from '../../types';
import {createPlaceholderValue, mergeDateTime} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
export type Granularity = 'day' | 'hour' | 'minute' | 'second';

export interface DatePickerState {
    /** The currently selected date. */
    value: DateTime | null;
    /** Sets the selected date. */
    setValue: (value: DateTime | null) => void;
    /**
     * The date portion of the value. This may be set prior to `value` if the user has
     * selected a date but has not yet selected a time.
     */
    dateValue: DateTime | null;
    /** Sets the date portion of the value. */
    setDateValue: (value: DateTime) => void;
    /**
     * The time portion of the value. This may be set prior to `value` if the user has
     * selected a time but has not yet selected a date.
     */
    timeValue: DateTime | null;
    /** Sets the time portion of the value. */
    setTimeValue: (value: DateTime | null) => void;
    /** Whether the field is read only. */
    readOnly?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Format of the date when rendered in the input. */
    format: string;
    /** Whether the date picker supports selecting a date. */
    hasDate: boolean;
    /** Whether the date picker supports selecting a time. */
    hasTime: boolean;
    /** Format of the time when rendered in the input. */
    timeFormat?: string;
    timeZone: string;
    /** Whether the calendar popover is currently open. */
    isOpen: boolean;
    /** Sets whether the calendar popover is open. */
    setOpen: (isOpen: boolean) => void;
    dateFieldState: DateFieldState;
}

export interface DatePickerStateOptions extends DateFieldBase {}

export function useDatePickerState(props: DatePickerStateOptions): DatePickerState {
    const {disabled, readOnly} = props;
    const [isOpen, setOpen] = React.useState(false);

    const [value, setValue] = useControlledState(
        props.value,
        props.defaultValue ?? null,
        props.onUpdate,
    );
    const [selectedDateInner, setSelectedDate] = React.useState<DateTime | null>(null);
    const [selectedTimeInner, setSelectedTime] = React.useState<DateTime | null>(null);

    const inputTimeZone = useDefaultTimeZone(
        props.value || props.defaultValue || props.placeholderValue,
    );
    const timeZone = props.timeZone || inputTimeZone;

    let selectedDate = selectedDateInner;
    let selectedTime = selectedTimeInner;

    const format = props.format || 'L';

    const commitValue = (date: DateTime, time: DateTime) => {
        if (disabled || readOnly) {
            return;
        }

        setValue(mergeDateTime(date, time).timeZone(inputTimeZone));
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const dateFieldState = useDateFieldState({
        value,
        onUpdate(date: DateTime | null) {
            if (date) {
                commitValue(date, date);
            } else {
                setValue(null);
            }
        },
        disabled,
        readOnly,
        validationState: props.validationState,
        minValue: props.minValue,
        maxValue: props.maxValue,
        isDateUnavailable: props.isDateUnavailable,
        format,
        placeholderValue: props.placeholderValue,
        timeZone,
    });

    const timeFormat = React.useMemo(() => {
        const hasSeconds = dateFieldState.sections.some((s) => s.type === 'second');
        return hasSeconds ? 'LTS' : 'LT';
    }, [dateFieldState.sections]);

    if (value) {
        selectedDate = value.timeZone(timeZone);
        if (dateFieldState.hasTime) {
            selectedTime = value.timeZone(timeZone);
        }
    }

    // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
    const selectDate = (newValue: DateTime) => {
        if (disabled || readOnly) {
            return;
        }

        const shouldClose = !dateFieldState.hasTime;
        if (dateFieldState.hasTime) {
            if (selectedTime || shouldClose) {
                commitValue(newValue, selectedTime || newValue);
            } else {
                setSelectedDate(newValue);
            }
        } else {
            commitValue(newValue, newValue);
        }

        if (shouldClose) {
            setOpen(false);
        }
    };

    const selectTime = (newValue: DateTime | null) => {
        if (disabled || readOnly) {
            return;
        }

        if (selectedDate && newValue) {
            commitValue(selectedDate, newValue);
        } else {
            setSelectedTime(newValue);
        }
    };

    if (dateFieldState.hasTime && !selectedTime) {
        selectedTime = dateFieldState.displayValue;
    }

    return {
        value,
        setValue(newDate: DateTime | null) {
            if (props.readOnly || props.disabled) {
                return;
            }

            if (newDate) {
                setValue(newDate.timeZone(inputTimeZone));
            } else {
                setValue(null);
            }
        },
        dateValue: selectedDate,
        timeValue: selectedTime,
        setDateValue: selectDate,
        setTimeValue: selectTime,
        disabled,
        readOnly,
        format,
        hasDate: dateFieldState.hasDate,
        hasTime: dateFieldState.hasTime,
        timeFormat,
        timeZone,
        isOpen,
        setOpen(newIsOpen) {
            if (!newIsOpen && !value && selectedDate && dateFieldState.hasTime) {
                commitValue(
                    selectedDate,
                    selectedTime ||
                        createPlaceholderValue({
                            placeholderValue: props.placeholderValue,
                            timeZone: inputTimeZone,
                        }),
                );
            }

            setOpen(newIsOpen);
        },
        dateFieldState,
    };
}
