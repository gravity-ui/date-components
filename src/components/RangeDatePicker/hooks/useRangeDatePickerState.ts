import type {DateTime} from '@gravity-ui/date-utils';

import {useRangeDateFieldState} from '../../DateField';
import type {RangeDateFieldStateOptions} from '../../DateField';
import type {FormatInfo} from '../../DateField/types';
import {adjustDateToFormat} from '../../DateField/utils';
import type {DatePickerState} from '../../DatePicker';
import {datePickerStateFactory} from '../../DatePicker/hooks/datePickerStateFactory';
import {getDateTimeValue} from '../../DatePicker/utils';
import type {RangeValue} from '../../types';
import {createPlaceholderRangeValue, mergeDateTime} from '../../utils/dates';

export type RangeDatePickerState = DatePickerState<RangeValue<DateTime>>;

export type RangeDatePickerStateOptions = RangeDateFieldStateOptions;

export const useRangeDatePickerState = datePickerStateFactory({
    getPlaceholderTime,
    mergeDateTime: mergeRangeDateTime,
    setTimezone,
    getDateTime: getDateTimeValue,
    useDateFieldState: useRangeDateFieldState,
    adjustDateToFormat: adjustRangeToFormat,
});

function getPlaceholderTime(
    placeholderValue: DateTime | undefined,
    timeZone?: string,
): RangeValue<DateTime> {
    return createPlaceholderRangeValue({placeholderValue, timeZone});
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

function adjustRangeToFormat(date: RangeValue<DateTime>, sectionsInfo: FormatInfo) {
    const start = adjustDateToFormat(date.start, sectionsInfo, 'startOf');
    const end = adjustDateToFormat(date.end, sectionsInfo, 'endOf');
    return {start, end};
}
