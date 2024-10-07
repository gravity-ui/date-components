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
