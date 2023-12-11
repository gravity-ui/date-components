import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {RangeDatepickerSingleValue} from '../../../types';

export function getDateTimeFromSingleValue(value: RangeDatepickerSingleValue): DateTime | null {
    if (!value) return null;
    return value.type === 'absolute'
        ? value.value
        : dateTimeParse(value.value, {allowRelative: true}) || null;
}
