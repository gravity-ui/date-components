import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {DateFieldState} from '../../DateField';
import type {DateFieldBase, PopupTriggerProps} from '../../types';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';

type OpenChangeReason =
    | 'EscapeKeyDown'
    | 'FocusOut'
    | 'ClickOutside'
    | 'ValueSelected'
    | 'TriggerButtonClick'
    | 'ShortcutKeyDown';

export interface DatePickerState<T = DateTime> {
    /** The currently selected date. */
    value: T | null;
    /** Sets the selected date. */
    setValue: (value: T | null) => void;
    /**
     * The date portion of the value. This may be set prior to `value` if the user has
     * selected a date but has not yet selected a time.
     */
    dateValue: T | null;
    /** Sets the date portion of the value. */
    setDateValue: (value: T) => void;
    /**
     * The time portion of the value. This may be set prior to `value` if the user has
     * selected a time but has not yet selected a date.
     */
    timeValue: T | null;
    /** Sets the time portion of the value. */
    setTimeValue: (value: T | null) => void;
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
    setOpen: (isOpen: boolean, reason: OpenChangeReason) => void;
    dateFieldState: DateFieldState<T>;
}

export interface DatePickerStateFactoryOptions<T, O extends DateFieldBase<T>> {
    getPlaceholderTime: (placeholderValue: DateTime | undefined, timeZone?: string) => T;
    mergeDateTime: (date: T, time: T) => T;
    setTimezone: (date: T, timeZone: string) => T;
    getDateTime: (date: T | null | undefined) => DateTime | undefined;
    useDateFieldState: (props: O) => DateFieldState<T>;
}

export interface DatePickerStateOptions<T>
    extends DateFieldBase<T>,
        PopupTriggerProps<[OpenChangeReason]> {}

export function datePickerStateFactory<T, O extends DatePickerStateOptions<T>>({
    getPlaceholderTime,
    mergeDateTime,
    setTimezone,
    getDateTime,
    useDateFieldState,
}: DatePickerStateFactoryOptions<T, O>) {
    return function useDatePickerState(props: O): DatePickerState<T> {
        const {disabled, readOnly} = props;
        const [isOpen, _setOpen] = useControlledState(
            props.open,
            props.defaultOpen ?? false,
            props.onOpenChange,
        );

        const setOpen: NonNullable<typeof props.onOpenChange> = _setOpen;

        const [value, setValue] = useControlledState(
            props.value as never,
            props.defaultValue ?? null,
            props.onUpdate,
        );
        const [selectedDateInner, setSelectedDate] = React.useState<T | null>(null);
        const [selectedTimeInner, setSelectedTime] = React.useState<T | null>(null);

        const inputTimeZone = useDefaultTimeZone(
            getDateTime(props.value) || getDateTime(props.defaultValue) || props.placeholderValue,
        );
        const timeZone = props.timeZone || inputTimeZone;

        let selectedDate = selectedDateInner;
        let selectedTime = selectedTimeInner;

        const format = props.format || 'L';

        const commitValue = (date: T, time: T) => {
            if (disabled || readOnly) {
                return;
            }

            setValue(setTimezone(mergeDateTime(date, time), inputTimeZone));
            setSelectedDate(null);
            setSelectedTime(null);
        };

        const dateFieldState = useDateFieldState({
            ...props,
            value,
            onUpdate(date: T | null) {
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
            if (!dateFieldState.hasTime) {
                return undefined;
            }
            const timeFormatParts: string[] = [];
            const hours = dateFieldState.sections.find((s) => s.type === 'hour');
            if (hours) {
                timeFormatParts.push(hours.format);
            }
            const minutes = dateFieldState.sections.find((s) => s.type === 'minute');
            if (minutes) {
                timeFormatParts.push(minutes.format);
            }
            const seconds = dateFieldState.sections.find((s) => s.type === 'second');
            if (seconds) {
                timeFormatParts.push(seconds.format);
            }
            const dayPeriod = dateFieldState.sections.find((s) => s.type === 'dayPeriod');
            return timeFormatParts.join(':') + (dayPeriod ? ` ${dayPeriod.format}` : '');
        }, [dateFieldState.hasTime, dateFieldState.sections]);

        if (value) {
            selectedDate = setTimezone(value, timeZone);
            if (dateFieldState.hasTime) {
                selectedTime = setTimezone(value, timeZone);
            }
        }

        // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
        const selectDate = (newValue: T) => {
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
                setOpen(false, 'ValueSelected');
            }
        };

        const selectTime = (newValue: T | null) => {
            if (disabled || readOnly) {
                return;
            }

            const newTime = newValue ?? getPlaceholderTime(props.placeholderValue, timeZone);

            if (selectedDate) {
                commitValue(selectedDate, newTime);
            } else {
                setSelectedTime(newTime);
            }
        };

        if (dateFieldState.hasTime && !selectedTime) {
            selectedTime = dateFieldState.displayValue;
        }

        return {
            value,
            setValue(newDate: T | null) {
                if (props.readOnly || props.disabled) {
                    return;
                }

                if (newDate) {
                    setValue(setTimezone(newDate, inputTimeZone));
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
            setOpen(newIsOpen, reason) {
                if (!newIsOpen && !value && selectedDate && dateFieldState.hasTime) {
                    commitValue(
                        selectedDate,
                        selectedTime || getPlaceholderTime(props.placeholderValue, props.timeZone),
                    );
                }

                setOpen(newIsOpen, reason);
            },
            dateFieldState,
        };
    };
}
