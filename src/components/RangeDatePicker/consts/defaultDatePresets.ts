import {i18n} from '../components/RangeDatePickerEditor/components/RangeDatePickerPresets/i18n';
import type {RangeDatepickerPreset} from '../types';

export const defaultDatePresets: RangeDatepickerPreset[] = [
    {
        start: 'now-1d',
        end: 'now',
        get title() {
            return i18n('Preset_last_1d');
        },
    },
    {
        start: 'now-3d',
        end: 'now',
        get title() {
            return i18n('Preset_last_3d');
        },
    },
    {
        start: 'now-1w',
        end: 'now',
        get title() {
            return i18n('Preset_last_1w');
        },
    },
    {
        start: 'now-1M',
        end: 'now',
        get title() {
            return i18n('Preset_last_1M');
        },
    },
    {
        start: 'now-3M',
        end: 'now',
        get title() {
            return i18n('Preset_last_3M');
        },
    },
    {
        start: 'now-6M',
        end: 'now',
        get title() {
            return i18n('Preset_last_6M');
        },
    },
    {
        start: 'now-1y',
        end: 'now',
        get title() {
            return i18n('Preset_last_1y');
        },
    },
    {
        start: 'now-3y',
        end: 'now',
        get title() {
            return i18n('Preset_last_3y');
        },
    },
];
