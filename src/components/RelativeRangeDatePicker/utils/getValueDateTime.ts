import {dateTimeParse} from '@gravity-ui/date-utils';

import type {RelativeRangeDatepickerSingleValue} from '../types';

export function getValueDateTime(value?: RelativeRangeDatepickerSingleValue, timeZone?: string) {
    if (!value) return null;
    if (value.type === 'absolute') return value.value;
    return dateTimeParse(value.value, {timeZone, allowRelative: true});
}
