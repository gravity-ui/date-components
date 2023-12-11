import {dateTimeParse} from '@gravity-ui/date-utils';

import type {RangeDatepickerValue} from '../../../types';

export const isNeededToFlipValue = (value: RangeDatepickerValue): boolean => {
    const {start, end} = value;

    if (!start || !end) {
        return false;
    }

    const startDateTime =
        start.type === 'relative' ? dateTimeParse(start.value, {allowRelative: true}) : start.value;
    const endDateTime =
        end.type === 'relative' ? dateTimeParse(end.value, {allowRelative: true}) : end.value;

    return Boolean(startDateTime && endDateTime && startDateTime.valueOf() > endDateTime.valueOf());
};
