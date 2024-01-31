import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {CalendarLayout} from './hooks/types';

export function constrainValue(
    value: DateTime,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    if (minValue && value.isBefore(minValue)) {
        return minValue;
    }
    if (maxValue && maxValue.isBefore(value)) {
        return maxValue;
    }

    return value;
}

export function getDaysInPeriod(startDate: DateTime, _endDate: DateTime, mode: CalendarLayout) {
    const days: DateTime[] = [];

    if (mode === 'days') {
        const currentDate = startDate.startOf('week');
        for (let i = 0; i < 42; i++) {
            days.push(currentDate.add({days: i}));
        }
    } else if (mode === 'quarters') {
        for (let i = 0; i < 16; i++) {
            days.push(startDate.add(i, 'quarters'));
        }
    } else {
        for (let i = 0; i < 12; i++) {
            days.push(startDate.add({[mode]: i}));
        }
    }
    return days;
}

export function getWeekDays() {
    const weekDays = [];
    const weekStart = dateTime().startOf('week');
    for (let i = 0; i < 7; i++) {
        const date = weekStart.add({days: i});
        weekDays.push(date);
    }
    return weekDays;
}

export const calendarLayouts: CalendarLayout[] = ['days', 'months', 'quarters', 'years'];
