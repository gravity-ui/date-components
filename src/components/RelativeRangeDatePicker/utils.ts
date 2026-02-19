import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';

import type {Value} from '../RelativeDatePicker';
import type {ExtractFunctionType, RangeValue} from '../types';

import type {Preset} from './components/Presets/defaultPresets';
import {i18n} from './components/Presets/i18n';
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
    format?: string;
    presets?: Preset[];
    presetsTranslations?: ExtractFunctionType<typeof i18n>;
    lang?: string;
}
export function getDefaultTitle({
    value,
    timeZone,
    alwaysShowAsAbsolute,
    format = 'L',
    presets,
    presetsTranslations = i18n,
    lang = 'en',
}: GetDefaultTitleArgs): string {
    if (!value) {
        return '';
    }

    const tz = timeZone === 'default' ? '' : ` (${getTimeZoneOffset(timeZone)})`;

    let from = '';
    if (value.start) {
        from =
            value.start.type === 'relative' && !alwaysShowAsAbsolute
                ? value.start.value
                : (dateTimeParse(value.start.value, {timeZone, lang})?.format(format) ?? '');
    }
    let to = '';
    if (value.end) {
        to =
            value.end.type === 'relative' && !alwaysShowAsAbsolute
                ? value.end.value
                : (dateTimeParse(value.end.value, {timeZone, roundUp: true, lang})?.format(
                      format,
                  ) ?? '');
    }

    if (
        !alwaysShowAsAbsolute &&
        value.start?.type === 'relative' &&
        value.end?.type === 'relative'
    ) {
        return getPresetTitle(value.start.value, value.end.value, presets, presetsTranslations);
    }

    const delimiter = ' — ';

    return `${from}${delimiter}${to}${tz}`;
}
