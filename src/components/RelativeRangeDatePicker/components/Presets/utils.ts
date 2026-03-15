import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {ExtractFunctionType} from '../../../types';

import {
    DEFAULT_DATE_PRESETS,
    DEFAULT_OTHERS_PRESETS,
    DEFAULT_TIME_PRESETS,
    allPresets,
} from './defaultPresets';
import type {Preset} from './defaultPresets';
import {i18n} from './i18n';

const lastRe = /^now-(\d+)([smhdwMy])$/;

const oneUnit = {
    s: 'Last second',
    m: 'Last minute',
    h: 'Last hour',
    d: 'Last day',
    w: 'Last week',
    M: 'Last month',
    y: 'Last year',
} as const;

const countUnit = {
    s: 'Last {count} second',
    m: 'Last {count} minute',
    h: 'Last {count} hour',
    d: 'Last {count} day',
    w: 'Last {count} week',
    M: 'Last {count} month',
    y: 'Last {count} year',
} as const;

export function getPresetTitle(
    start: string | null,
    end: string | null,
    presets: Preset[] = allPresets,
    t: ExtractFunctionType<typeof i18n> = i18n,
): string {
    const startText = start?.replace(/\s+/g, '') ?? start;
    const endText = end?.replace(/\s+/g, '') ?? end;

    for (const preset of presets) {
        if (preset.from === startText && preset.to === endText) {
            return t(preset.title as any);
        }
    }
    if (!startText) {
        return `${t('To')}: ${endText}`;
    }
    if (!endText) {
        return `${t('From')}: ${startText}`;
    }

    if (endText === 'now') {
        const match = lastRe.exec(startText);
        if (match) {
            const [, count, unit] = match;
            if (isDateUnit(unit)) {
                const template = Number(count) === 1 ? oneUnit[unit] : countUnit[unit];
                return t(template, {count});
            }
        }
    }

    return startText + ' — ' + endText;
}

function isDateUnit(value: string): value is 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y' {
    return ['s', 'm', 'h', 'd', 'w', 'M', 'y'].includes(value);
}

export function filterPresetList(
    presets: Preset[],
    {minValue, allowNullableValues}: {minValue?: DateTime; allowNullableValues?: boolean} = {},
) {
    return presets.filter((preset) => {
        const from = preset.from ? dateTimeParse(preset.from) : undefined;
        const to = preset.to ? dateTimeParse(preset.to, {roundUp: true}) : undefined;

        const hasNullableFrom = allowNullableValues && preset.from === null;
        const hasNullableTo = allowNullableValues && preset.to === null;

        if ((!from && !hasNullableFrom) || (!to && !hasNullableTo)) {
            return false;
        }

        if (to?.isBefore(from)) {
            return false;
        }

        if (minValue && from?.isBefore(minValue)) {
            return false;
        }

        return true;
    });
}

export interface PresetTab {
    id: string;
    title: string;
    presets: Preset[];
}

export function getDefaultPresetTabs({
    withTime,
    minValue,
    allowNullableValues,
    t = i18n,
}: {
    minValue?: DateTime;
    withTime?: boolean;
    allowNullableValues?: boolean;
    t?: (key: 'Main' | 'Other') => string;
}) {
    const tabs: PresetTab[] = [];

    const mainTab: PresetTab = {
        id: 'main',
        title: t('Main'),
        presets: [],
    };
    const mainPresets = DEFAULT_DATE_PRESETS;
    if (withTime) {
        mainPresets.unshift(...DEFAULT_TIME_PRESETS);
    }
    mainTab.presets = filterPresetList(mainPresets, {minValue, allowNullableValues});

    if (mainTab.presets.length > 0) {
        tabs.push(mainTab);
    }

    const otherTab: PresetTab = {
        id: 'other',
        title: t('Other'),
        presets: filterPresetList(DEFAULT_OTHERS_PRESETS, {minValue, allowNullableValues}),
    };

    if (otherTab.presets.length > 0) {
        tabs.push(otherTab);
    }

    return tabs;
}

export function filterPresetTabs(
    tabs: PresetTab[],
    {minValue, allowNullableValues}: {minValue?: DateTime; allowNullableValues?: boolean} = {},
) {
    return tabs.reduce<PresetTab[]>((acc, tab) => {
        const presets = filterPresetList(tab.presets, {minValue, allowNullableValues});
        if (presets.length) {
            acc.push({
                ...tab,
                presets,
            });
        }
        return acc;
    }, []);
}
