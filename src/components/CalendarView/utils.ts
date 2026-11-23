import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {CalendarLayout, CalendarState, RangeCalendarState} from './hooks/types';

export function getDaysInPeriod(state: CalendarState | RangeCalendarState) {
    const days: DateTime[] = [];

    const startDate = dateTime({input: state.startDate, timeZone: state.timeZone});
    if (state.mode === 'days') {
        const currentDate = startDate.startOf('week');
        for (let i = 0; i < 42; i++) {
            days.push(currentDate.add({days: i}));
        }
    } else if (state.mode === 'quarters') {
        for (let i = 0; i < 16; i++) {
            days.push(startDate.add(i, 'quarters'));
        }
    } else {
        for (let i = 0; i < 12; i++) {
            days.push(startDate.add({[state.mode]: i}));
        }
    }
    return days;
}

export function getWeekDays(state: CalendarState | RangeCalendarState) {
    const weekDays = [];
    const weekStart = dateTime({timeZone: state.timeZone}).startOf('week');
    for (let i = 0; i < 7; i++) {
        const date = weekStart.add({days: i});
        weekDays.push(date);
    }
    return weekDays;
}

export const calendarLayouts: CalendarLayout[] = ['days', 'months', 'quarters', 'years'];

export function getPageDate(
    date: DateTime,
    mode: CalendarLayout,
    direction: 'next' | 'previous',
    larger?: boolean,
) {
    const sign = direction === 'next' ? 1 : -1;
    if (mode === 'days') {
        return date.add({months: sign * (larger ? 12 : 1)});
    }
    if (mode === 'quarters') {
        return date.add(sign * 4, 'years');
    }
    return date.add(sign * 12, mode);
}

export function getStartDate(date: DateTime, mode: CalendarLayout) {
    if (mode === 'days') {
        return date.startOf('month');
    }

    if (mode === 'months') {
        return date.startOf('year');
    }

    const years = mode === 'quarters' ? 4 : 12;
    const year = Math.floor(date.year() / years) * years;
    return date.startOf('year').set('year', year);
}

export function getEndDate(date: DateTime, mode: CalendarLayout) {
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
