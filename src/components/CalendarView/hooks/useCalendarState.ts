import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {ValueBase} from '../../types';
import {constrainValue, createPlaceholderValue, isWeekend, mergeDateTime} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
import {calendarLayouts} from '../utils';

import type {
    CalendarLayout,
    CalendarState,
    CalendarStateOptionsBase,
    CalendarValueType,
    SelectionMode,
} from './types';

export interface CalendarStateOptions<T = DateTime>
    extends ValueBase<T | null, Exclude<T, null>>, CalendarStateOptionsBase {}

export type {CalendarState} from './types';

const defaultModes: Record<CalendarLayout, boolean> = {
    days: true,
    months: true,
    quarters: false,
    years: true,
};
export function useCalendarState<M extends SelectionMode = 'single'>(
    props: CalendarStateOptions<CalendarValueType<M>> & {selectionMode?: M},
): CalendarState<M> {
    const {disabled, readOnly, modes = defaultModes, selectionMode = 'single' as M} = props;
    const [value, setValue] = useControlledState<DateTime | DateTime[] | null>(
        props.value,
        props.defaultValue ?? (selectionMode === 'single' ? null : []),
        props.onUpdate as any,
    );
    const availableModes = calendarLayouts.filter((l) => modes[l]);
    const minMode = availableModes[0] || 'days';

    const [mode, setMode] = useControlledState(
        props.mode,
        props.defaultMode ?? minMode,
        props.onUpdateMode,
    );

    const currentMode = mode && availableModes.includes(mode) ? mode : minMode;
    const firstValue = Array.isArray(value) ? (value[0] ?? null) : value;

    const inputTimeZone = useDefaultTimeZone(
        firstValue || props.focusedValue || props.defaultFocusedValue,
    );
    const timeZone = props.timeZone || inputTimeZone;

    const minValue = React.useMemo(
        () => (props.minValue ? props.minValue.timeZone(timeZone) : undefined),
        [timeZone, props.minValue],
    );

    const maxValue = React.useMemo(
        () => (props.maxValue ? props.maxValue.timeZone(timeZone) : undefined),
        [timeZone, props.maxValue],
    );

    const focusedValue = React.useMemo(() => {
        if (!props.focusedValue) {
            return props.focusedValue;
        }
        return constrainValue(props.focusedValue.timeZone(timeZone), minValue, maxValue);
    }, [props.focusedValue, minValue, maxValue, timeZone]);

    const defaultFocusedValue = React.useMemo(() => {
        const defaultValue =
            (props.defaultFocusedValue ? props.defaultFocusedValue : firstValue)?.timeZone(
                timeZone,
            ) || createPlaceholderValue({timeZone}).startOf(minMode);
        return constrainValue(defaultValue, minValue, maxValue);
    }, [maxValue, minValue, props.defaultFocusedValue, timeZone, firstValue, minMode]);
    const [focusedDateInner, setFocusedDate] = useControlledState(
        focusedValue,
        defaultFocusedValue,
        (date: DateTime) => {
            props.onFocusUpdate?.(date.timeZone(inputTimeZone));
        },
    );

    const focusedDate =
        focusedDateInner?.timeZone(timeZone) ??
        constrainValue(createPlaceholderValue({timeZone}), minValue, maxValue);

    if (isInvalid(focusedDate, minValue, maxValue)) {
        // If the focused date was moved to an invalid value, it can't be focused, so constrain it.
        setFocusedDate(constrainValue(focusedDate, minValue, maxValue));
    }

    function focusCell(date: DateTime) {
        setFocusedDate(constrainValue(date.startOf(currentMode), minValue, maxValue));
    }

    const [isFocused, setFocused] = React.useState(props.autoFocus || false);

    const startDate = getStartDate(focusedDate, currentMode);
    const endDate = getEndDate(focusedDate, currentMode);

    const finalValue =
        selectionMode === 'single'
            ? firstValue
            : Array.isArray(value)
              ? value
              : value
                ? [value]
                : [];

    return {
        disabled,
        readOnly,
        value: finalValue as CalendarValueType<M>,
        setValue(date) {
            if (!disabled && !readOnly) {
                if (selectionMode === 'single') {
                    let newValue = Array.isArray(date) ? (date[0] ?? null) : date;
                    if (!newValue) {
                        setValue(null);
                        return;
                    }
                    newValue = constrainValue(newValue, minValue, maxValue);
                    if (firstValue) {
                        // If there is a date already selected, then we want to keep its time
                        newValue = mergeDateTime(newValue, firstValue.timeZone(timeZone));
                    }
                    if (this.isCellUnavailable(newValue)) {
                        return;
                    }
                    setValue(newValue.timeZone(inputTimeZone));
                } else {
                    let dates: DateTime[] = [];
                    if (Array.isArray(date)) {
                        dates = date;
                    } else if (date !== null) {
                        dates = [date];
                    }

                    setValue(dates);
                }
            }
        },
        timeZone,
        selectDate(date: DateTime, force = false) {
            if (!disabled) {
                if (!readOnly && (force || this.mode === minMode)) {
                    if (force && currentMode !== minMode) {
                        setMode(minMode);
                    }
                    const selectedDate = constrainValue(date.startOf(minMode), minValue, maxValue);
                    if (this.isCellUnavailable(selectedDate)) {
                        return;
                    }
                    if (selectionMode === 'single') {
                        this.setValue(selectedDate);
                    } else {
                        const newValue = Array.isArray(value) ? [...value] : [];
                        if (value && !Array.isArray(value)) {
                            newValue.push(value);
                        }
                        let found = false;
                        let index = -1;
                        while (
                            (index = newValue.findIndex((d) =>
                                selectedDate.isSame(d.timeZone(timeZone), currentMode),
                            )) !== -1
                        ) {
                            found = true;
                            newValue.splice(index, 1);
                        }
                        if (!found) {
                            newValue.push(selectedDate.timeZone(inputTimeZone));
                        }
                        this.setValue(newValue);
                    }
                } else {
                    this.zoomIn();
                }
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
            focusCell(focusedDate.add(1, this.mode));
        },
        focusPreviousCell() {
            focusCell(focusedDate.subtract(1, this.mode));
        },
        focusNextRow() {
            if (this.mode === 'days') {
                focusCell(focusedDate.add(1, 'week'));
            } else if (this.mode === 'quarters') {
                focusCell(focusedDate.add(1, 'years'));
            } else {
                focusCell(focusedDate.add(3, this.mode));
            }
        },
        focusPreviousRow() {
            if (this.mode === 'days') {
                focusCell(focusedDate.subtract(1, 'week'));
            } else if (this.mode === 'quarters') {
                focusCell(focusedDate.subtract(1, 'years'));
            } else {
                focusCell(focusedDate.subtract(3, this.mode));
            }
        },
        focusNextPage(larger?: boolean) {
            if (this.mode === 'days') {
                focusCell(focusedDate.add({months: larger ? 12 : 1}));
            } else if (this.mode === 'quarters') {
                focusCell(focusedDate.add(4, 'years'));
            } else {
                focusCell(focusedDate.add(12, this.mode));
            }
        },
        focusPreviousPage(larger?: boolean) {
            if (this.mode === 'days') {
                focusCell(focusedDate.subtract({months: larger ? 12 : 1}));
            } else if (this.mode === 'quarters') {
                focusCell(focusedDate.subtract(4, 'years'));
            } else {
                focusCell(focusedDate.subtract(12, this.mode));
            }
        },
        focusSectionStart() {
            focusCell(getStartDate(focusedDate, this.mode));
        },
        focusSectionEnd() {
            focusCell(getEndDate(focusedDate, this.mode));
        },
        zoomIn() {
            const nextMode = availableModes[availableModes.indexOf(this.mode) - 1];
            if (nextMode) {
                this.setMode(nextMode);
            }
        },
        zoomOut() {
            const nextMode = availableModes[availableModes.indexOf(this.mode) + 1];
            if (nextMode) {
                this.setMode(nextMode);
            }
        },
        selectFocusedDate() {
            this.selectDate(focusedDate, true);
        },
        isFocused,
        setFocused,
        isInvalid(date: DateTime) {
            return isInvalid(date, this.minValue, this.maxValue, this.mode);
        },
        isPreviousPageInvalid() {
            const prev = this.startDate.subtract(1, 'day');
            return this.isInvalid(prev);
        },
        isNextPageInvalid() {
            const next = this.endDate.endOf(this.mode).add(1, 'day');
            return this.isInvalid(next);
        },
        isSelected(date: DateTime) {
            if (!value || !firstValue || this.isCellDisabled(date)) {
                return false;
            }
            if (selectionMode === 'single') {
                return date.isSame(firstValue.timeZone(timeZone), currentMode);
            }

            const dates = Array.isArray(value) ? value : [value];
            return dates.some((d) => date.isSame(d.timeZone(timeZone), currentMode));
        },
        isCellUnavailable(date: DateTime) {
            return props.isDateUnavailable ? props.isDateUnavailable(date) : false;
        },
        isCellFocused(date: DateTime) {
            return this.isFocused && focusedDate && date.isSame(focusedDate, currentMode);
        },
        isCellDisabled(date: DateTime) {
            return this.disabled || this.isInvalid(date);
        },
        isWeekend(date: DateTime) {
            if (this.mode !== 'days') {
                return false;
            }
            if (typeof props.isWeekend === 'function') {
                return props.isWeekend(date);
            }
            return isWeekend(date);
        },
        isCurrent(date: DateTime) {
            return dateTime({timeZone}).isSame(date, this.mode);
        },
        mode: currentMode,
        setMode,
        availableModes,
    };
}

function getStartDate(date: DateTime, mode: CalendarLayout) {
    if (mode === 'days') {
        return date.startOf('month');
    }

    if (mode === 'months') {
        return date.startOf('year');
    }

    if (mode === 'quarters') {
        const year = Math.floor(date.year() / 4) * 4;
        return date.startOf('year').set('year', year);
    }

    const year = Math.floor(date.year() / 12) * 12;
    return date.startOf('year').set('year', year);
}

function getEndDate(date: DateTime, mode: CalendarLayout) {
    if (mode === 'days') {
        return date.endOf('month').startOf('day');
    }

    if (mode === 'months') {
        return date.endOf('year').startOf('month');
    }

    const startDate = getStartDate(date, mode);
    if (mode === 'quarters') {
        return startDate.add(15, 'quarters');
    }

    return startDate.add({[mode]: 11});
}

function isInvalid(
    date: DateTime,
    minValue?: DateTime,
    maxValue?: DateTime,
    mode: CalendarLayout = 'days',
) {
    const constrainedDate = constrainValue(date, minValue, maxValue);
    return !constrainedDate.isSame(date, mode);
}
