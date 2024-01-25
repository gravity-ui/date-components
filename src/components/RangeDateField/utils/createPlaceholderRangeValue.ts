import {type PlaceholderValueOptions, createPlaceholderValue} from '../../utils/dates';

export function createPlaceholderRangeValue({placeholderValue, timeZone}: PlaceholderValueOptions) {
    const start = createPlaceholderValue({placeholderValue, timeZone});
    const end = start.add(1, 'hour');

    return {start, end};
}
