import type {DateTime} from '@gravity-ui/date-utils';

import {useDateFieldState} from '../../DateField';
import type {DateFieldBase} from '../../types';
import {createPlaceholderValue, mergeDateTime} from '../../utils/dates';
import {getDateTimeValue} from '../utils';

import {datePickerStateFactory} from './datePickerStateFactory';

export type {DatePickerState, Granularity} from './datePickerStateFactory';

export interface DatePickerStateOptions extends DateFieldBase {}

export const useDatePickerState = datePickerStateFactory({
    getPlaceholderTime,
    mergeDateTime,
    setTimezone: (date, timeZone) => date.timeZone(timeZone),
    getDateTime: getDateTimeValue,
    useDateFieldState,
});

function getPlaceholderTime(placeholderValue: DateTime | undefined, timeZone?: string) {
    return createPlaceholderValue({placeholderValue, timeZone});
}
