import React from 'react';

import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Tabs} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import type {Meta, StoryObj} from '@storybook/react';

import type {RangeValue} from '../../types/index.js';
import {RangeCalendar} from '../RangeCalendar.js';

const meta: Meta<typeof RangeCalendar> = {
    title: 'Components/RangeCalendar',
    component: RangeCalendar,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RangeCalendar>;

export const Default: Story = {
    render: function Render(args) {
        const timeZone = args.timeZone;
        const props = {
            ...args,
            minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
            maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
            focusedValue: args.focusedValue
                ? dateTimeParse(args.focusedValue, {timeZone})
                : undefined,
            defaultFocusedValue: args.defaultFocusedValue
                ? dateTimeParse(args.defaultFocusedValue, {timeZone})
                : undefined,
            isDateUnavailable: getIsDateUnavailable(args.isDateUnavailable as unknown as string),
        };

        const [value, setValue] = React.useState<RangeValue<DateTime> | null>(null);
        return (
            <div>
                <RangeCalendar
                    {...props}
                    value={value}
                    onUpdate={(v) => {
                        setValue(v);
                        args.onUpdate?.(v);
                    }}
                />
                <div>
                    Selected range:{' '}
                    {value ? `${value.start.format('L')} - ${value.end.format('L')}` : ''}
                </div>
            </div>
        );
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'calendar-on-change-cb',
                title: 'onUpdate callback',
                type: 'success',
                content: (
                    <div>
                        <div>date: {`${res.start.format('L')} - ${res.end.format('L')}`}</div>
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
    },
};

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
                {Default.render?.({...args, modes: {[mode]: true}}, {} as any)}
            </div>
        );
    },
    parameters: {
        controls: {exclude: ['mode', 'defaultMode', 'modes']},
    },
};
