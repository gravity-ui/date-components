import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

export function isWeekend(date: DateTime) {
    return [0, 6].includes(date.day());
}

interface PlaceholderValueOptions {
    placeholderValue?: DateTime;
    timeZone?: string;
}
export function createPlaceholderValue({placeholderValue, timeZone}: PlaceholderValueOptions) {
    return placeholderValue ?? dateTime({timeZone}).startOf('day');
}

export function createPlaceholderRangeValue({placeholderValue, timeZone}: PlaceholderValueOptions) {
    const date = createPlaceholderValue({placeholderValue, timeZone});
    return {start: date.startOf('day'), end: date.endOf('day')};
}

export function isInvalid(
    value: DateTime | null | undefined,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    if (!value) {
        return false;
    }

    if (minValue && value.isBefore(minValue)) {
        return true;
    }
    if (maxValue && maxValue.isBefore(value)) {
        return true;
    }

    return false;
}

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

export function mergeDateTime(date: DateTime, time: DateTime) {
    return date
        .set('hours', time.hour())
        .set('minutes', time.minute())
        .set('seconds', time.second());
}

export function formatDateTime(date: DateTime, format: string, timezone: string, lang: string) {
    return dateTime({input: date, timeZone: timezone, lang}).format(format);
}
