import {guessUserTimeZone} from '@gravity-ui/date-utils';

import type {RelativeRangeDatepickerSingleValue, RelativeRangeDatepickerValue} from '../types';

function updateTimeZoneForSingle(
    value: RelativeRangeDatepickerSingleValue,
    timeZone = guessUserTimeZone(),
): RelativeRangeDatepickerSingleValue {
    if (value?.type === 'absolute') {
        return {type: 'absolute', value: value.value.timeZone(timeZone, false)};
    }
    return value;
}

export function updateTimeZone(
    value: RelativeRangeDatepickerValue | null,
    timeZone = guessUserTimeZone(),
): RelativeRangeDatepickerValue | null {
    if (!value) return value;
    return {
        start: updateTimeZoneForSingle(value.start, timeZone),
        end: updateTimeZoneForSingle(value.end, timeZone),
    };
}
