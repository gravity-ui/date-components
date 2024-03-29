import {isValid} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {RangeValue} from '../../types';

export function isValidRange({start, end}: RangeValue<DateTime>): boolean {
    return isValid(start) && isValid(end) && (start.isSame(end) || start.isBefore(end));
}
