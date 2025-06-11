import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';

import type {Value} from '../RelativeDatePicker';
import type {RangeValue} from '../types';

import type {Preset} from './components/Presets/defaultPresets';
import {getPresetTitle} from './components/Presets/utils';

export function resolveTimeZone(timeZone: string) {
    if (timeZone === 'default' || timeZone === 'system') {
        return dateTime({timeZone}).timeZone();
    }

    return timeZone;
}

export function normalizeTimeZone(timeZone: string) {
    const lowered = timeZone.toLowerCase();
    if (lowered === 'default' || lowered === 'system') {
        return lowered;
    }

    return resolveTimeZone(timeZone);
}

export function getTimeZoneOffset(timeZone: string) {
    return `UTC ${dateTime({timeZone}).format('Z')}`;
}

interface GetDefaultTitleArgs {
    value: RangeValue<Value | null> | null;
    timeZone: string;
    alwaysShowAsAbsolute?: boolean;
    allowNullableValues?: boolean;
    format?: string;
    presets?: Preset[];
}

const isPresetValue = (value: RangeValue<Value | null> | null, allowNullableValues?: boolean) => {
    if (!value || value.start?.type === 'absolute' || value.end?.type === 'absolute') {
        return null;
    }
    if (!allowNullableValues && (value.start === null || value.end === null)) {
        // we can't get here with no nullable values allowed but just in case...
        return null;
    }
    let start, end;
    if (value.start === null) {
        start = null;
    }
    if (value.start?.type === 'relative') {
        start = value.start?.value || '';
    }
    if (value.end === null) {
        end = null;
    }
    if (value.end?.type === 'relative') {
        end = value.end?.value || '';
    }
    return {start, end};
};
export function getDefaultTitle({
    value,
    timeZone,
    alwaysShowAsAbsolute,
    allowNullableValues,
    format = 'L',
    presets,
}: GetDefaultTitleArgs) {
    if (!value) {
        return '';
    }

    const tz = timeZone === 'default' ? '' : ` (${getTimeZoneOffset(timeZone)})`;

    let from = '';
    if (value.start) {
        from =
            value.start.type === 'relative' && !alwaysShowAsAbsolute
                ? value.start.value
                : dateTimeParse(value.start.value, {timeZone})?.format(format) ?? '';
    }
    let to = '';
    if (value.end) {
        to =
            value.end.type === 'relative' && !alwaysShowAsAbsolute
                ? value.end.value
                : dateTimeParse(value.end.value, {timeZone, roundUp: true})?.format(format) ?? '';
    }

    const presetSearch = isPresetValue(value, allowNullableValues);
    if (!alwaysShowAsAbsolute && presetSearch) {
        return `${getPresetTitle(presetSearch.start, presetSearch.end, presets)}`;
    }

    const delimiter = ' — ';

    return `${from}${delimiter}${to}${tz}`;
}
