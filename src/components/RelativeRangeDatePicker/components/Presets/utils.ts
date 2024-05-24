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

export function getPresetTitle(start: string, end: string, presets: Preset[] = allPresets) {
    const startText = start.replace(/\s+/g, '');
    const endText = end.replace(/\s+/g, '');

    for (const preset of presets) {
        if (preset.from === startText && preset.to === endText) {
            return preset.title;
        }
    }

    if (end === 'now') {
        const match = /^now-(\d+)([m|h|d|w|M|y])$/.exec(start);
        if (match) {
            const [, count, unit] = match;
            if (isDateUnit(unit)) {
                return i18n('Last {count} {unit}', {
                    count,
                    unit: i18n(unit, {count: Number(count)}),
                });
            }
        }
    }

    return startText + ' — ' + endText;
}

function isDateUnit(value: string): value is 'm' | 'h' | 'd' | 'w' | 'M' | 'y' {
    return ['m', 'h', 'd', 'w', 'M', 'y'].includes(value);
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
}: {
    minValue?: DateTime;
    withTime?: boolean;
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
    mainTab.presets = filterPresets(mainPresets, minValue);

    if (mainTab.presets.length > 0) {
        tabs.push(mainTab);
    }

    const otherTab: PresetTab = {
        id: 'other',
        title: i18n('Other'),
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
