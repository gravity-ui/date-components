import {i18n} from '../RelativeRangeDatePickerEditor/RelativeRangeDatePickerPresets/i18n';
import type {RelativeRangeDatepickerPreset} from '../types';

export const defaultOtherPresets: RelativeRangeDatepickerPreset[] = [
    {
        start: 'now/d',
        end: 'now/d+1d',
        get title() {
            return i18n('Preset_today');
        },
    },
    {
        start: 'now-1d/d',
        end: 'now-1d/d+1d',
        get title() {
            return i18n('Preset_yesterday');
        },
    },
    {
        start: 'now/w',
        end: 'now+1w/w',
        get title() {
            return i18n('Preset_this_w');
        },
    },
    {
        start: 'now/M',
        end: 'now+1M/M',
        get title() {
            return i18n('Preset_this_M');
        },
    },
    {
        start: 'now/y',
        end: 'now+1y/y',
        get title() {
            return i18n('Preset_this_y');
        },
    },
    {
        start: 'now/d',
        end: 'now',
        get title() {
            return i18n('Preset_from_start_of_d');
        },
    },
    {
        start: 'now/w',
        end: 'now',
        get title() {
            return i18n('Preset_from_start_of_w');
        },
    },
    {
        start: 'now/M',
        end: 'now',
        get title() {
            return i18n('Preset_from_start_of_M');
        },
    },
    {
        start: 'now/y',
        end: 'now',
        get title() {
            return i18n('Preset_from_start_of_y');
        },
    },
];
