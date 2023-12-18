import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {RelativeRangeDatepickerSingleValue} from '../../../types';

export function getDateTimeFromSingleValue(
    value: RelativeRangeDatepickerSingleValue,
): DateTime | null {
    if (!value) return null;
    return value.type === 'absolute'
        ? value.value
        : dateTimeParse(value.value, {allowRelative: true}) || null;
}
