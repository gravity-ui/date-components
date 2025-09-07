import {i18n} from './i18n';

export interface Preset {
    from: string;
    to: string;
    title: React.ReactNode;
}

export function PresetTitle({
    title,
}: {
    title: keyof (typeof i18n.keysetData)['g-date-relative-range-date-picker-presets'];
}) {
    const {t} = i18n.useTranslation();
    return t(title);
}

export const DEFAULT_DATE_PRESETS: Preset[] = [
    {
        from: 'now-1d',
        to: 'now',
        title: <PresetTitle title="Last day" />,
    },
    {
        from: 'now-3d',
        to: 'now',
        title: <PresetTitle title="Last 3 days" />,
    },
    {
        from: 'now-1w',
        to: 'now',
        title: <PresetTitle title="Last week" />,
    },
    {
        from: 'now-1M',
        to: 'now',
        title: <PresetTitle title="Last month" />,
    },
    {
        from: 'now-3M',
        to: 'now',
        title: <PresetTitle title="Last 3 months" />,
    },
    {
        from: 'now-6M',
        to: 'now',
        title: <PresetTitle title="Last 6 months" />,
    },
    {
        from: 'now-1y',
        to: 'now',
        title: <PresetTitle title="Last year" />,
    },
    {
        from: 'now-3y',
        to: 'now',
        title: <PresetTitle title="Last 3 years" />,
    },
];

export const DEFAULT_TIME_PRESETS: Preset[] = [
    {
        from: 'now-5m',
        to: 'now',
        title: <PresetTitle title="Last 5 minutes" />,
    },
    {
        from: 'now-15m',
        to: 'now',
        title: <PresetTitle title="Last 15 minutes" />,
    },
    {
        from: 'now-30m',
        to: 'now',
        title: <PresetTitle title="Last 30 minutes" />,
    },
    {
        from: 'now-1h',
        to: 'now',
        title: <PresetTitle title="Last hour" />,
    },
    {
        from: 'now-3h',
        to: 'now',
        title: <PresetTitle title="Last 3 hours" />,
    },
    {
        from: 'now-6h',
        to: 'now',
        title: <PresetTitle title="Last 6 hours" />,
    },
    {
        from: 'now-12h',
        to: 'now',
        title: <PresetTitle title="Last 12 hours" />,
    },
];

export const DEFAULT_OTHERS_PRESETS: Preset[] = [
    {
        from: 'now/d',
        to: 'now/d',
        title: <PresetTitle title="Today" />,
    },
    {
        from: 'now-1d/d',
        to: 'now-1d/d',
        title: <PresetTitle title="Yesterday" />,
    },
    {
        from: 'now-2d/d',
        to: 'now-2d/d',
        title: <PresetTitle title="Day before yesterday" />,
    },
    {
        from: 'now/w',
        to: 'now/w',
        title: <PresetTitle title="This week" />,
    },
    {
        from: 'now/M',
        to: 'now/M',
        title: <PresetTitle title="This month" />,
    },
    {
        from: 'now/y',
        to: 'now/y',
        title: <PresetTitle title="This year" />,
    },
    {
        from: 'now/d',
        to: 'now',
        title: <PresetTitle title="From start of day" />,
    },
    {
        from: 'now/w',
        to: 'now',
        title: <PresetTitle title="From start of week" />,
    },
    {
        from: 'now/M',
        to: 'now',
        title: <PresetTitle title="From start of month" />,
    },
    {
        from: 'now/y',
        to: 'now',
        title: <PresetTitle title="From start of year" />,
    },
];

export const allPresets = DEFAULT_TIME_PRESETS.concat(DEFAULT_DATE_PRESETS, DEFAULT_OTHERS_PRESETS);
