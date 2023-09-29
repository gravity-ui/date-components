import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {useControlledState} from '../../hooks/useControlledState';
import type {ValueBase} from '../../types';
import {createPlaceholderValue} from '../../utils/dates';
import {calendarLayouts, constrainValue} from '../utils';

import type {CalendarLayout, CalendarState, CalendarStateOptionsBase} from './types';

export interface CalendarStateOptions extends ValueBase<DateTime>, CalendarStateOptionsBase {}
export type {CalendarState} from './types';

const defaultModes: Record<CalendarLayout, boolean> = {
    days: true,
    months: true,
    quarters: false,
    years: true,
};
export function useCalendarState(props: CalendarStateOptions): CalendarState {
    const {disabled, readOnly, minValue, maxValue, timeZone, modes = defaultModes} = props;
    const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onUpdate);
    const [mode, setMode] = useControlledState(props.mode, props.defaultMode, props.onUpdateMode);

    const availableModes = calendarLayouts.filter((l) => modes[l]);
    const minMode = availableModes[0] || 'days';
    const currentMode = mode && availableModes.includes(mode) ? mode : minMode;

    const focusedValue = React.useMemo(() => {
        if (!props.focusedValue) {
            return props.focusedValue;
        }
        return constrainValue(props.focusedValue, minValue, maxValue);
    }, [props.focusedValue, minValue, maxValue]);

    const defaultFocusedValue = React.useMemo(() => {
        const defaultValue =
            (props.defaultFocusedValue ? props.defaultFocusedValue : value) ||
            createPlaceholderValue({timeZone}).startOf(minMode);
        return constrainValue(defaultValue, minValue, maxValue);
    }, [maxValue, minValue, props.defaultFocusedValue, timeZone, value, minMode]);
    const [focusedDateInner, setFocusedDate] = useControlledState(
        focusedValue,
        defaultFocusedValue,
        props.onFocusUpdate,
    );

    const focusedDate =
        focusedDateInner ??
        constrainValue(createPlaceholderValue({timeZone}).startOf(minMode), minValue, maxValue);

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

    return {
        disabled,
        readOnly,
        value,
        setValue,
        timeZone,
        selectDate(date: DateTime, force = false) {
            if (!disabled) {
                if (!readOnly && (force || this.mode === minMode)) {
                    const newValue = constrainValue(date, minValue, maxValue);
                    if (this.isCellUnavailable(newValue)) {
                        return;
                    }
                    setValue(newValue);
                    if (force && currentMode !== minMode) {
                        setMode(minMode);
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
            const index = availableModes.indexOf(this.mode) - 1;
            if (index >= 0) {
                this.setMode(availableModes[index]);
            }
        },
        zoomOut() {
            const index = availableModes.indexOf(this.mode) + 1;
            if (index < availableModes.length) {
                this.setMode(availableModes[index]);
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
            return (
                Boolean(value) &&
                date.isSame(value ?? undefined, currentMode) &&
                !this.isCellDisabled(date)
            );
        },
        isCellUnavailable(date: DateTime) {
            if (this.mode === minMode) {
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
