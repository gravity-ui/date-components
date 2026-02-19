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
    start: string,
    end: string,
    presets: Preset[] = allPresets,
    t: ExtractFunctionType<typeof i18n> = i18n,
): string {
    const startText = start.replace(/\s+/g, '');
    const endText = end.replace(/\s+/g, '');

    for (const preset of presets) {
        if (preset.from === startText && preset.to === endText) {
            return t(preset.title as any);
        }
    }

    if (end === 'now') {
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

export function filterPresets(presets: Preset[], minValue?: DateTime) {
    return presets.filter((preset) => {
        const from = dateTimeParse(preset.from);
        const to = dateTimeParse(preset.to, {roundUp: true});

        if (!from || !to) {
            return false;
        }

        if (to.isBefore(from)) {
            return false;
        }

        if (minValue && from.isBefore(minValue)) {
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
    t = i18n,
}: {
    minValue?: DateTime;
    withTime?: boolean;
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
    mainTab.presets = filterPresets(mainPresets, minValue);

    if (mainTab.presets.length > 0) {
        tabs.push(mainTab);
    }

    const otherTab: PresetTab = {
        id: 'other',
        title: t('Other'),
        presets: filterPresets(DEFAULT_OTHERS_PRESETS, minValue),
    };

    if (otherTab.presets.length > 0) {
        tabs.push(otherTab);
    }

    return tabs;
}

export function filterPresetTabs(tabs: PresetTab[], {minValue}: {minValue?: DateTime} = {}) {
    return tabs.reduce<PresetTab[]>((acc, tab) => {
        const presets = filterPresets(tab.presets, minValue);
        if (presets.length) {
            acc.push({
                ...tab,
                presets,
            });
        }
        return acc;
    }, []);
}
