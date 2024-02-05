import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

export interface PlaceholderValueOptions {
    placeholderValue?: DateTime;
    timeZone?: string;
}
export function createPlaceholderValue({placeholderValue, timeZone}: PlaceholderValueOptions) {
    return (
        placeholderValue ?? dateTime({timeZone}).set('hour', 0).set('minute', 0).set('second', 0)
    );
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

export function mergeDateTime(date: DateTime, time: DateTime) {
    return date
        .set('hours', time.hour())
        .set('minutes', time.minute())
        .set('seconds', time.second());
}
