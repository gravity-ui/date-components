import {type DateTime, isValid} from '@gravity-ui/date-utils';

import type {RangeValue} from '../../types';

export function isValidRange({start, end}: RangeValue<DateTime>): boolean {
    return isValid(start) && isValid(end) && start.isBefore(end);
}
