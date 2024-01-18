import {type DateTime, dateTimeParse} from '@gravity-ui/date-utils';

import type {
    RelativeRangeDatepickerSingleValue,
    RelativeRangeDatepickerValue,
} from '../../../types';

function getDateTimeFromSingleValue(value: RelativeRangeDatepickerSingleValue): DateTime | null {
    if (!value) return null;
    return value.type === 'absolute'
        ? value.value
        : dateTimeParse(value.value, {allowRelative: true}) || null;
}

export const getFlippedValue = (
    changed: keyof RelativeRangeDatepickerValue,
    value: RelativeRangeDatepickerValue,
): RelativeRangeDatepickerValue => {
    const {start, end} = value;
    if (!start || !end) return value;

    const startDateTime = getDateTimeFromSingleValue(start);
    const endDateTime = getDateTimeFromSingleValue(end);

    if (!startDateTime || !endDateTime) return value;

    const flippedValue: RelativeRangeDatepickerValue = {
        start: null,
        end: null,
    };

    if (end.type === 'relative') {
        flippedValue.start = end;
    } else if (changed === 'end') {
        flippedValue.start = {
            type: 'absolute',
            value: endDateTime
                .set('hours', startDateTime.hour())
                .set('minute', startDateTime.minute())
                .set('seconds', startDateTime.second()),
        };
    }

    if (start.type === 'relative') {
        flippedValue.end = start;
    } else if (changed === 'start') {
        flippedValue.end = {
            type: 'absolute',
            value: startDateTime
                .set('hours', endDateTime.hour())
                .set('minute', endDateTime.minute())
                .set('seconds', endDateTime.second()),
        };
    }

    return flippedValue;
};
