import {i18n} from './i18n';

export interface Preset {
    from: string;
    to: string;
    title: string;
}

export const DEFAULT_DATE_PRESETS: Preset[] = [
    {
        from: 'now-1d',
        to: 'now',
        get title() {
            return i18n('Last day');
        },
    },
    {
        from: 'now-3d',
        to: 'now',
        get title() {
            return i18n('Last 3 days');
        },
    },
    {
        from: 'now-1w',
        to: 'now',
        get title() {
            return i18n('Last week');
        },
    },
    {
        from: 'now-1M',
        to: 'now',
        get title() {
            return i18n('Last month');
        },
    },
    {
        from: 'now-3M',
        to: 'now',
        get title() {
            return i18n('Last 3 months');
        },
    },
    {
        from: 'now-6M',
        to: 'now',
        get title() {
            return i18n('Last 6 months');
        },
    },
    {
        from: 'now-1y',
        to: 'now',
        get title() {
            return i18n('Last year');
        },
    },
    {
        from: 'now-3y',
        to: 'now',
        get title() {
            return i18n('Last 3 years');
        },
    },
];

export const DEFAULT_TIME_PRESETS: Preset[] = [
    {
        from: 'now-5m',
        to: 'now',
        get title() {
            return i18n('Last 5 minutes');
        },
    },
    {
        from: 'now-15m',
        to: 'now',
        get title() {
            return i18n('Last 15 minutes');
        },
    },
    {
        from: 'now-30m',
        to: 'now',
        get title() {
            return i18n('Last 30 minutes');
        },
    },
    {
        from: 'now-1h',
        to: 'now',
        get title() {
            return i18n('Last hour');
        },
    },
    {
        from: 'now-3h',
        to: 'now',
        get title() {
            return i18n('Last 3 hours');
        },
    },
    {
        from: 'now-6h',
        to: 'now',
        get title() {
            return i18n('Last 6 hours');
        },
    },
    {
        from: 'now-12h',
        to: 'now',
        get title() {
            return i18n('Last 12 hours');
        },
    },
];

export const DEFAULT_OTHERS_PRESETS: Preset[] = [
    {
        from: 'now/d',
        to: 'now/d',
        get title() {
            return i18n('Today');
        },
    },
    {
        from: 'now-1d/d',
        to: 'now-1d/d',
        get title() {
            return i18n('Yesterday');
        },
    },
    {
        from: 'now-2d/d',
        to: 'now-2d/d',
        get title() {
            return i18n('Day before yesterday');
        },
    },
    {
        from: 'now/w',
        to: 'now/w',
        get title() {
            return i18n('This week');
        },
    },
    {
        from: 'now/M',
        to: 'now/M',
        get title() {
            return i18n('This month');
        },
    },
    {
        from: 'now/y',
        to: 'now/y',
        get title() {
            return i18n('This year');
        },
    },
    {
        from: 'now/d',
        to: 'now',
        get title() {
            return i18n('From start of day');
        },
    },
    {
        from: 'now/w',
        to: 'now',
        get title() {
            return i18n('From start of week');
        },
    },
    {
        from: 'now/M',
        to: 'now',
        get title() {
            return i18n('From start of month');
        },
    },
    {
        from: 'now/y',
        to: 'now',
        get title() {
            return i18n('From start of year');
        },
    },
];

export const allPresets = DEFAULT_TIME_PRESETS.concat(DEFAULT_DATE_PRESETS, DEFAULT_OTHERS_PRESETS);
