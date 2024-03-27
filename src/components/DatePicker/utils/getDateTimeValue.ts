import type {DateTime} from '@gravity-ui/date-utils';

import type {RangeValue} from '../../types';

export function getDateTimeValue(
    value: DateTime | RangeValue<DateTime> | null | undefined,
): DateTime | undefined {
    if (!value) {
        return undefined;
    }

    return 'start' in value && 'end' in value ? value.start : value;
}
