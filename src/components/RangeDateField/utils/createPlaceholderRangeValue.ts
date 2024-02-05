import {type PlaceholderValueOptions, createPlaceholderValue} from '../../utils/dates';

export function createPlaceholderRangeValue({placeholderValue, timeZone}: PlaceholderValueOptions) {
    const date = createPlaceholderValue({placeholderValue, timeZone});
    return {start: date, end: date};
}
