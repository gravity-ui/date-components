import {pick} from '../../../utils/pick';
import type {DateFieldBase} from '../../types';
import type {RelativeRangeDatepickerValue} from '../types';

export function getFieldProps<TProps extends DateFieldBase<RelativeRangeDatepickerValue>>(
    props: TProps,
) {
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
