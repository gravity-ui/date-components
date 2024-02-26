import {dateTimeParse} from '@gravity-ui/date-utils';

import type {RelativeRangeDatepickerSingleValue} from '../../types';

type Opts = {
    value?: RelativeRangeDatepickerSingleValue;
    format?: string;
    alwaysShowAsAbsolute?: boolean;
    timeZone?: string;
};

export function getDateLabel(opts: Opts) {
    const {value} = opts;
    if (!value) return '';
    if (value.type === 'relative') {
        if (!opts.alwaysShowAsAbsolute) {
            return value.value;
        }

        let dateTime = dateTimeParse(value.value);
        if (!dateTime) return '';
        if (opts.timeZone) {
            dateTime = dateTime.timeZone(opts.timeZone);
        }
        return dateTime.format(opts.format || 'L');
    }
    return value.value.format(opts.format || 'L');
}
