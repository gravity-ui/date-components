import {pick} from '../../../utils/pick';
import type {DateFieldBase} from '../../types';
import type {RangeDatepickerValue} from '../types';

export function getFieldProps<TProps extends DateFieldBase<RangeDatepickerValue>>(props: TProps) {
    return pick(
        props,
        'minValue',
        'maxValue',
        'isDateUnavailable',
        'format',
        'placeholderValue',
        'timeZone',
    );
}
