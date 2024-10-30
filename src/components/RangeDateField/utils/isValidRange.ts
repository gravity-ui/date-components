import type {DateTime} from '@gravity-ui/date-utils';

import type {RangeValue} from '../../types';

export function isValidRange({start, end}: RangeValue<DateTime>): boolean {
    return start.isValid() && end.isValid() && (start.isSame(end) || start.isBefore(end));
}
