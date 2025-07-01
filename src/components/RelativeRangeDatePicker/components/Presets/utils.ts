import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

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
) {
    const startText = start?.replace(/\s+/g, '') ?? start;
    const endText = end?.replace(/\s+/g, '') ?? end;

    for (const preset of presets) {
        if (preset.from === startText && preset.to === endText) {
            return preset.title;
        }
    }
    if (!startText) {
        return `${i18n('To')}: ${endText}`;
    }
    if (!endText) {
        return `${i18n('From')}: ${startText}`;
    }

    if (endText === 'now') {
        const match = lastRe.exec(startText);
        if (match) {
            const [, count, unit] = match;
            if (isDateUnit(unit)) {
                const template = Number(count) === 1 ? oneUnit[unit] : countUnit[unit];
                return i18n(template, {count});
            }
        }
    }

    return startText + ' — ' + endText;
}

function isDateUnit(value: string): value is 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y' {
    return ['s', 'm', 'h', 'd', 'w', 'M', 'y'].includes(value);
}

export function filterPresets(
    presets: Preset[],
    minValue?: DateTime,
    allowNullableValues?: boolean,
) {
    return presets.filter((preset) => {
        const from = dateTimeParse(preset.from);
        const to = dateTimeParse(preset.to, {roundUp: true});

        if (!allowNullableValues && (!from || !to)) {
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
}: {
    minValue?: DateTime;
    withTime?: boolean;
    allowNullableValues?: boolean;
}) {
    const tabs: PresetTab[] = [];

    const mainTab: PresetTab = {
        id: 'main',
        title: i18n('Main'),
        presets: [],
    };
    const mainPresets = DEFAULT_DATE_PRESETS;
    if (withTime) {
        mainPresets.unshift(...DEFAULT_TIME_PRESETS);
    }
    mainTab.presets = filterPresets(mainPresets, minValue, allowNullableValues);

    if (mainTab.presets.length > 0) {
        tabs.push(mainTab);
    }

    const otherTab: PresetTab = {
        id: 'other',
        title: i18n('Other'),
        presets: filterPresets(DEFAULT_OTHERS_PRESETS, minValue, allowNullableValues),
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
        const presets = filterPresets(tab.presets, minValue, allowNullableValues);
        if (presets.length) {
            acc.push({
                ...tab,
                presets,
            });
        }
        return acc;
    }, []);
}
