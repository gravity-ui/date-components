import type {DateTime} from '@gravity-ui/date-utils';

import {datePickerStateFactory} from '../../DatePicker';
import type {DatePickerState} from '../../DatePicker';
import {getDateTimeValue} from '../../DatePicker/utils';
import {useRangeDateFieldState} from '../../RangeDateField';
import type {RangeDateFieldStateOptions} from '../../RangeDateField';
import type {RangeValue} from '../../types';
import {createPlaceholderValue, mergeDateTime} from '../../utils/dates';

export type {Granularity} from '../../DatePicker';

export type RangeDatePickerState = DatePickerState<RangeValue<DateTime>>;

export type RangeDatePickerStateOptions = RangeDateFieldStateOptions;

export const useRangeDatePickerState = datePickerStateFactory({
    getPlaceholderTime,
    mergeDateTime: mergeRangeDateTime,
    setTimezone,
    getDateTime: getDateTimeValue,
    useDateFieldState: useRangeDateFieldState,
});

function getPlaceholderTime(
    placeholderValue: DateTime | undefined,
    timeZone?: string,
): RangeValue<DateTime> {
    const date = createPlaceholderValue({placeholderValue, timeZone});
    return {start: date, end: date};
}

function mergeRangeDateTime(
    date: RangeValue<DateTime>,
    time: RangeValue<DateTime>,
): RangeValue<DateTime> {
    const start = mergeDateTime(date.start, time.start);
    const end = mergeDateTime(date.end, time.end);
    return {start, end};
}

function setTimezone(date: RangeValue<DateTime>, timeZone: string): RangeValue<DateTime> {
    const start = date.start.timeZone(timeZone);
    const end = date.end.timeZone(timeZone);
    return {start, end};
}
