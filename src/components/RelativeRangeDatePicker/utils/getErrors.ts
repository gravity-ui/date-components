import type {DateTime} from '@gravity-ui/date-utils';

import {i18n} from '../i18n';
import type {RelativeRangeDatepickerValue} from '../types';

import {getValueDateTime} from './getValueDateTime';

interface Opts {
    value?: RelativeRangeDatepickerValue | null;
    minValue?: DateTime;
    maxValue?: DateTime;
    allowNullableValues: boolean;
}

function getStartError(opts: Opts) {
    const {value, minValue} = opts;

    if (!value) return undefined;

    if (value.end && !value.start) {
        if (opts.allowNullableValues) return undefined;
        return i18n('Error_start-missing');
    }

    const start = getValueDateTime(value.start);
    const end = getValueDateTime(value.end);

    if (!start) {
        return value.start ? i18n('Error_incorrect-start') : undefined;
    }

    if (start.isAfter(end)) {
        return i18n('Error_start-greater-then-end');
    }

    if (minValue && start.valueOf() < minValue.valueOf()) {
        return i18n('Error_min');
    }

    return undefined;
}

function getEndError(opts: Opts) {
    const {value, maxValue} = opts;

    if (!value) return undefined;

    if (value.start && !value.end) {
        if (opts.allowNullableValues) return undefined;
        return i18n('Error_end-missing');
    }

    const start = getValueDateTime(value.start);
    const end = getValueDateTime(value.end);

    if (!end) {
        return value.end ? i18n('Error_incorrect-end') : undefined;
    }

    if (end.isBefore(start)) {
        return i18n('Error_end-less-then-start');
    }

    if (maxValue && end.valueOf() > maxValue.valueOf()) {
        return i18n('Error_max');
    }

    return undefined;
}

export function getErrors(opts: Opts) {
    return {
        startError: getStartError(opts),
        endError: getEndError(opts),
    };
}
