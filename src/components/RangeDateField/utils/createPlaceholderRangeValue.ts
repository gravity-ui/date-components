import {createPlaceholderValue} from '../../utils/dates';
import type {PlaceholderValueOptions} from '../../utils/dates';

export function createPlaceholderRangeValue({placeholderValue, timeZone}: PlaceholderValueOptions) {
    const date = createPlaceholderValue({placeholderValue, timeZone});
    return {start: date.startOf('day'), end: date.endOf('day')};
}
