import React from 'react';

import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import {Calendar} from '../Calendar';

const meta: Meta<typeof Calendar> = {
    title: 'Components/Calendar',
    component: Calendar,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
};

export default meta;

type Story = StoryObj<typeof Calendar>;

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
            isWeekend: getIsWeekend(args.isWeekend as unknown as string),
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
        isWeekend: {
            options: ['default', 'none', 'Friday and Saturday'],
            control: {
                type: 'radio',
            },
        },
        timeZone: timeZoneControl,
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

function getIsWeekend(variant: string) {
    if (variant === 'Friday and Saturday') {
        return (date: DateTime) => [5, 6].includes(date.day());
    }

    if (variant === 'none') {
        return () => false;
    }

    return undefined;
}

export const Custom: Story = {
    ...Default,
    render: function Custom(args) {
        const [mode, setMode] = React.useState('days');

        return (
            <TabProvider value={mode} onUpdate={setMode}>
                <TabList>
                    {['days', 'months', 'quarters', 'years'].map((item) => (
                        <Tab key={item} value={item}>
                            {item[0].toUpperCase() + item.slice(1)}
                        </Tab>
                    ))}
                </TabList>
                <TabPanel value={mode}>
                    {Default.render?.({...args, modes: {[mode]: true}})}
                </TabPanel>
            </TabProvider>
        );
    },
    parameters: {
        controls: {exclude: ['mode', 'defaultMode', 'modes']},
    },
};
