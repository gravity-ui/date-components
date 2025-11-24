import type {i18n} from './i18n';

export interface Preset {
    from: string;
    to: string;
    title: string;
}

export interface DefaultPreset {
    from: string;
    to: string;
    title: keyof (typeof i18n.keysetData)['g-date-relative-range-date-picker-presets'];
}

export const DEFAULT_DATE_PRESETS: DefaultPreset[] = [
    {
        from: 'now-1d',
        to: 'now',
        title: 'Last day',
    },
    {
        from: 'now-3d',
        to: 'now',
        title: 'Last 3 days',
    },
    {
        from: 'now-1w',
        to: 'now',
        title: 'Last week',
    },
    {
        from: 'now-1M',
        to: 'now',
        title: 'Last month',
    },
    {
        from: 'now-3M',
        to: 'now',
        title: 'Last 3 months',
    },
    {
        from: 'now-6M',
        to: 'now',
        title: 'Last 6 months',
    },
    {
        from: 'now-1y',
        to: 'now',
        title: 'Last year',
    },
    {
        from: 'now-3y',
        to: 'now',
        title: 'Last 3 years',
    },
];

export const DEFAULT_TIME_PRESETS: DefaultPreset[] = [
    {
        from: 'now-5m',
        to: 'now',
        title: 'Last 5 minutes',
    },
    {
        from: 'now-15m',
        to: 'now',
        title: 'Last 15 minutes',
    },
    {
        from: 'now-30m',
        to: 'now',
        title: 'Last 30 minutes',
    },
    {
        from: 'now-1h',
        to: 'now',
        title: 'Last hour',
    },
    {
        from: 'now-3h',
        to: 'now',
        title: 'Last 3 hours',
    },
    {
        from: 'now-6h',
        to: 'now',
        title: 'Last 6 hours',
    },
    {
        from: 'now-12h',
        to: 'now',
        title: 'Last 12 hours',
    },
];

export const DEFAULT_OTHERS_PRESETS: DefaultPreset[] = [
    {
        from: 'now/d',
        to: 'now/d',
        title: 'Today',
    },
    {
        from: 'now-1d/d',
        to: 'now-1d/d',
        title: 'Yesterday',
    },
    {
        from: 'now-2d/d',
        to: 'now-2d/d',
        title: 'Day before yesterday',
    },
    {
        from: 'now/w',
        to: 'now/w',
        title: 'This week',
    },
    {
        from: 'now/M',
        to: 'now/M',
        title: 'This month',
    },
    {
        from: 'now/y',
        to: 'now/y',
        title: 'This year',
    },
    {
        from: 'now/d',
        to: 'now',
        title: 'From start of day',
    },
    {
        from: 'now/w',
        to: 'now',
        title: 'From start of week',
    },
    {
        from: 'now/M',
        to: 'now',
        title: 'From start of month',
    },
    {
        from: 'now/y',
        to: 'now',
        title: 'From start of year',
    },
];

export const allPresets = DEFAULT_TIME_PRESETS.concat(DEFAULT_DATE_PRESETS, DEFAULT_OTHERS_PRESETS);
