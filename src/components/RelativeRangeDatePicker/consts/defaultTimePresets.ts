import {i18n} from '../RelativeRangeDatePickerEditor/RelativeRangeDatePickerPresets/i18n';
import type {RelativeRangeDatepickerPreset} from '../types';

export const defaultTimePresets: RelativeRangeDatepickerPreset[] = [
    {
        start: 'now-5m',
        end: 'now',
        get title() {
            return i18n('Preset_last_5m');
        },
    },
    {
        start: 'now-30m',
        end: 'now',
        get title() {
            return i18n('Preset_last_30m');
        },
    },
    {
        start: 'now-1h',
        end: 'now',
        get title() {
            return i18n('Preset_last_1h');
        },
    },
    {
        start: 'now-3h',
        end: 'now',
        get title() {
            return i18n('Preset_last_3h');
        },
    },
    {
        start: 'now-6h',
        end: 'now',
        get title() {
            return i18n('Preset_last_6h');
        },
    },
    {
        start: 'now-12h',
        end: 'now',
        get title() {
            return i18n('Preset_last_12h');
        },
    },
];
