import React from 'react';

import {dateTime, dateTimeParse, getTimeZonesList} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Tabs} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import type {Meta, StoryObj} from '@storybook/react';

import {Calendar} from '../Calendar';

const meta: Meta<typeof Calendar> = {
    title: 'Components/Calendar',
    component: Calendar,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Calendar>;

const zones = getTimeZonesList().reduce<Record<string, string>>((l, zone) => {
    l[zone] = `${zone} (UTC ${dateTime({timeZone: zone}).format('Z')})`;
    return l;
}, {});

export const Default = {
    render: (args) => {
        const timeZone = args.timeZone;
        const props = {
            ...args,
            minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
            maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
            value: args.value ? dateTimeParse(args.value, {timeZone}) : undefined,
            defaultValue: args.defaultValue
                ? dateTimeParse(args.defaultValue, {timeZone})
                : undefined,
            focusedValue: args.focusedValue
                ? dateTimeParse(args.focusedValue, {timeZone})
                : undefined,
            defaultFocusedValue: args.defaultFocusedValue
                ? dateTimeParse(args.defaultFocusedValue, {timeZone})
                : undefined,
            isDateUnavailable: getIsDateUnavailable(args.isDateUnavailable as unknown as string),
        };
        return <Calendar {...props} />;
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'calendar-on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        <div>date: {res.format() || 'null'}</div>
                    </div>
                ),
            });
        },
    },
    argTypes: {
        minValue: {
            control: {
                type: 'text',
            },
        },
        maxValue: {
            control: {
                type: 'text',
            },
        },
        value: {
            control: {
                type: 'text',
            },
        },
        defaultValue: {
            control: {
                type: 'text',
            },
        },
        focusedValue: {
            control: {
                type: 'text',
            },
        },
        defaultFocusedValue: {
            control: {
                type: 'text',
            },
        },
        isDateUnavailable: {
            options: ['weekend', 'ranges', 'none'],
            control: {
                type: 'radio',
            },
        },
        timeZone: {
            options: ['none', ...Object.keys(zones)],
            mapping: {
                none: undefined,
            },
            control: {
                type: 'select',
                labels: zones,
            },
        },
    },
} satisfies Story;

function getIsDateUnavailable(variant: string) {
    if (variant === 'weekend') {
        return (date: DateTime) => {
            return [0, 6].includes(date.day());
        };
    }

    if (variant === 'ranges') {
        const now = dateTime();
        const disabledRanges = [
            [now, now.add({days: 5})],
            [now.add({days: 14}), now.add({days: 16})],
            [now.add({days: 23}), now.add({days: 24})],
        ];

        return (date: DateTime) =>
            disabledRanges.some(
                (interval) =>
                    (date.isSame(interval[0], 'date') || date.isAfter(interval[0])) &&
                    (date.isSame(interval[1], 'date') || date.isBefore(interval[1])),
            );
    }

    return undefined;
}

export const Custom: Story = {
    ...Default,
    render: function Custom(args) {
        const [mode, setMode] = React.useState('days');

        return (
            <div>
                <Tabs
                    activeTab={mode}
                    onSelectTab={(id) => {
                        setMode(id);
                    }}
                    items={['days', 'months', 'quarters', 'years'].map((item) => ({
                        id: item,
                        title: item[0].toUpperCase() + item.slice(1),
                    }))}
                />
                {Default.render?.({...args, modes: {[mode]: true}})}
            </div>
        );
    },
    parameters: {
        controls: {exclude: ['mode', 'defaultMode', 'modes']},
    },
};
