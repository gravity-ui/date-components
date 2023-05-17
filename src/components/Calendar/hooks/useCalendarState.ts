import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {useControlledState} from '../../hooks/useControlledState';
import {constrainValue} from '../utils';

export type CalendarState = ReturnType<typeof useCalendarState>;

export interface CalendarStateOptions {
    disabled?: boolean;
    readOnly?: boolean;
    value?: DateTime | null;
    defaultValue?: DateTime;
    onUpdate?: (date: DateTime) => void;
    minValue?: DateTime;
    maxValue?: DateTime;
    isDateUnavailable?: (date: DateTime) => boolean;
    autoFocus?: boolean;
    focusedValue?: DateTime;
    defaultFocusedValue?: DateTime;
    onFocusUpdate?: (date: DateTime) => void;
    mode?: 'days' | 'months' | 'years';
    defaultMode?: 'days' | 'months' | 'years';
    onUpdateMode?: (mode: 'days' | 'months' | 'years') => void;
    timeZone?: string;
}
export function useCalendarState(props: CalendarStateOptions) {
    const {disabled, readOnly, minValue, maxValue, timeZone} = props;
    const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onUpdate);
    const [mode, setMode] = useControlledState(props.mode, props.defaultMode, props.onUpdateMode);

    const currentMode = mode || 'days';

    const focusedValue = React.useMemo(() => {
        if (!props.focusedValue) {
            return undefined;
        }
        return constrainValue(props.focusedValue, minValue, maxValue);
    }, [props.focusedValue, minValue, maxValue]);

    const defaultFocusedValue = React.useMemo(() => {
        const defaultValue =
            (props.defaultFocusedValue ? props.defaultFocusedValue : value) || dateTime({timeZone});
        return constrainValue(defaultValue, minValue, maxValue);
    }, [maxValue, minValue, props.defaultFocusedValue, timeZone, value]);
    const [focusedDate, setFocusedDate] = useControlledState(
        focusedValue,
        defaultFocusedValue,
        props.onFocusUpdate,
    );

    if (!focusedDate) {
        throw new Error('Focused date is not set.');
    }

    if (isInvalid(focusedDate, minValue, maxValue)) {
        // If the focused date was moved to an invalid value, it can't be focused, so constrain it.
        setFocusedDate(constrainValue(focusedDate, minValue, maxValue));
    }

    function focusCell(date: DateTime) {
        setFocusedDate(constrainValue(date, minValue, maxValue));
    }

    const [isFocused, setFocused] = React.useState(props.autoFocus || false);

    const startDate = getStartDate(focusedDate, currentMode);
    const endDate = getEndDate(focusedDate, currentMode);

    return {
        disabled,
        readOnly,
        value,
        timeZone,
        setValue(date: DateTime) {
            if (!disabled && !readOnly) {
                const newValue = constrainValue(date, minValue, maxValue);
                if (this.isCellUnavailable(newValue)) {
                    return;
                }
                setValue(constrainValue(newValue, minValue, maxValue));
            }
        },
        minValue,
        maxValue,
        focusedDate,
        startDate,
        endDate,
        setFocusedDate(date: DateTime) {
            focusCell(date);
            setFocused(true);
        },
        focusNextCell() {
            focusCell(focusedDate.add({[this.mode]: 1}));
        },
        focusPreviousCell() {
            focusCell(focusedDate.subtract({[this.mode]: 1}));
        },
        focusNextRow() {
            if (this.mode === 'days') {
                focusCell(focusedDate.add(1, 'week'));
            } else {
                focusCell(focusedDate.add({[this.mode]: 3}));
            }
        },
        focusPreviousRow() {
            if (this.mode === 'days') {
                focusCell(focusedDate.subtract(1, 'week'));
            } else {
                focusCell(focusedDate.subtract({[this.mode]: 3}));
            }
        },
        focusNextPage() {
            if (this.mode === 'days') {
                focusCell(focusedDate.add({months: 1}));
            } else {
                focusCell(focusedDate.add({[this.mode]: 12}));
            }
        },
        focusPreviousPage() {
            if (this.mode === 'days') {
                focusCell(focusedDate.subtract({months: 1}));
            } else {
                focusCell(focusedDate.subtract({[this.mode]: 12}));
            }
        },
        focusSectionStart() {
            focusCell(getStartDate(focusedDate, this.mode));
        },
        focusSectionEnd() {
            focusCell(getEndDate(focusedDate, this.mode));
        },
        zoomIn() {
            this.setMode(this.mode === 'years' ? 'months' : 'days');
        },
        zoomOut() {
            this.setMode(this.mode === 'days' ? 'months' : 'years');
        },
        selectFocusedDate() {
            this.setValue(focusedDate);
        },
        isFocused,
        setFocused,
        isInvalid(date: DateTime) {
            return isInvalid(date, this.minValue, this.maxValue, this.mode);
        },
        isSelected(date: DateTime) {
            return (
                Boolean(value) &&
                date.isSame(value ?? undefined, currentMode) &&
                !this.isCellDisabled(date)
            );
        },
        isCellUnavailable(date: DateTime) {
            if (this.mode === 'days') {
                return Boolean(props.isDateUnavailable && props.isDateUnavailable(date));
            } else {
                return false;
            }
        },
        isCellFocused(date: DateTime) {
            return this.isFocused && focusedDate && date.isSame(focusedDate, currentMode);
        },
        isCellDisabled(date: DateTime) {
            return this.disabled || this.isInvalid(date);
        },
        isWeekend(date: DateTime) {
            return this.mode === 'days' && [0, 6].includes(date.day());
        },
        mode: currentMode,
        setMode,
    };
}

function getStartDate(date: DateTime, mode: 'days' | 'months' | 'years') {
    if (mode === 'days') {
        return date.startOf('month');
    }

    if (mode === 'months') {
        return date.startOf('year');
    }

    const year = Math.floor(date.year() / 12) * 12;
    return date.startOf('year').set('year', year);
}

function getEndDate(date: DateTime, mode: 'days' | 'months' | 'years') {
    if (mode === 'days') {
        return date.endOf('month').startOf('day');
    }

    if (mode === 'months') {
        return date.endOf('month').startOf('day');
    }

    const startDate = getStartDate(date, mode);
    return startDate.add({[mode]: 11});
}

function isInvalid(
    date: DateTime,
    minValue?: DateTime,
    maxValue?: DateTime,
    mode: 'days' | 'months' | 'years' = 'days',
) {
    const constrainedDate = constrainValue(date, minValue, maxValue);
    return !constrainedDate.isSame(date, mode);
}
