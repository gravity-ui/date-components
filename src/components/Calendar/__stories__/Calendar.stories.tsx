import React from 'react';

import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from 'storybook/actions';

import preview from '#.storybook/preview';

import {timeZoneControl} from '../../../demo/utils/zones';
import {Calendar} from '../Calendar';

const meta = preview.meta({
    title: 'Components/Calendar',
    component: Calendar,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
});

export const Default = meta.story({
    render: (args) => {
        const timeZone = args.timeZone;
        const props = {
            ...args,
            minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
            maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
            value: args.value ? dateTimeParse(args.value, {timeZone}) : args.value,
            defaultValue: args.defaultValue
                ? dateTimeParse(args.defaultValue, {timeZone})
                : args.defaultValue,
            focusedValue: args.focusedValue
                ? dateTimeParse(args.focusedValue, {timeZone})
                : args.focusedValue,
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
            action('onUpdate')(res);
            const resArray = Array.isArray(res) ? res : [res];
            toaster.add({
                name: 'calendar-on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        <div>date: {resArray.map((r) => r.format()).join(', ') || `[]`}</div>
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
});

const DefaultComponent = Default.input.render;
Object.assign(DefaultComponent, {displayName: 'Calendar'});

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

export const Custom = Default.extend({
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
                    <DefaultComponent {...args} modes={{[mode]: true}} />
                </TabPanel>
            </TabProvider>
        );
    },
    parameters: {
        controls: {exclude: ['mode', 'defaultMode', 'modes']},
    },
});

export const ClearableCalendar = Default.extend({
    render: function ClearableCalendar(props) {
        const [value, setValue] = React.useState<DateTime | null>(null);
        return (
            <DefaultComponent
                {...props}
                value={value}
                // @ts-expect-error
                onUpdate={(v: DateTime) => {
                    if (v.isSame(value, 'day')) {
                        setValue(null);
                    } else {
                        setValue(v);
                    }
                    props.onUpdate?.(v);
                }}
            />
        );
    },
    parameters: {
        controls: {exclude: ['selectionMode', 'value', 'defaultValue']},
    },
});
