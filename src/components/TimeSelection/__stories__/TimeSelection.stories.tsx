import React from 'react';

import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';

import preview from '#.storybook/preview';

import {timeZoneControl} from '../../../demo/utils/zones';
import {TimeSelection} from '../TimeSelection';

const meta = preview.meta({
    title: 'Components/TimeSelection',
    component: TimeSelection,
    tags: ['autodocs'],
    args: {
        'aria-label': 'Time',
        onUpdate: action('onUpdate'),
        onFocusViewUpdate: action('onFocusViewUpdate'),
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
});

function parseDate(value: unknown, timeZone?: string) {
    return typeof value === 'string' && value ? dateTimeParse(value, {timeZone}) : undefined;
}

export const Default = meta.story({
    render: (args) => {
        const timeZone = args.timeZone;
        const props = {
            ...args,
            value: args.value ? parseDate(args.value, timeZone) : args.value,
            defaultValue: args.defaultValue
                ? parseDate(args.defaultValue, timeZone)
                : args.defaultValue,
            placeholderValue: parseDate(args.placeholderValue, timeZone),
            minValue: parseDate(args.minValue, timeZone),
            maxValue: parseDate(args.maxValue, timeZone),
        };
        return <TimeSelection {...props} />;
    },
    argTypes: {
        value: {control: {type: 'text'}},
        defaultValue: {control: {type: 'text'}},
        placeholderValue: {control: {type: 'text'}},
        minValue: {control: {type: 'text'}},
        maxValue: {control: {type: 'text'}},
        views: {
            options: ['hours', 'minutes', 'seconds'],
            control: {type: 'check'},
        },
        size: {
            options: ['s', 'm', 'l', 'xl'],
            control: {type: 'radio'},
        },
        timeZone: timeZoneControl,
    },
});

const DefaultComponent = Default.input.render;
Object.assign(DefaultComponent, {displayName: 'TimeSelection'});

const sampleValue = dateTime({input: '2024-01-15T10:30:45'});

export const WithSeconds = Default.extend({
    args: {
        views: ['hours', 'minutes', 'seconds'],
    },
    render: (args) => <TimeSelection {...args} defaultValue={sampleValue} />,
    parameters: {
        controls: {exclude: ['value', 'defaultValue']},
    },
});

export const AmPm = Default.extend({
    args: {
        ampm: true,
    },
    render: (args) => <TimeSelection {...args} defaultValue={sampleValue.set('hours', 15)} />,
    parameters: {
        controls: {exclude: ['value', 'defaultValue']},
    },
});

export const Steps = Default.extend({
    args: {
        views: ['hours', 'minutes', 'seconds'],
        timeSteps: {hours: 2, minutes: 5, seconds: 15},
    },
    render: (args) => <TimeSelection {...args} defaultValue={sampleValue} />,
    parameters: {
        controls: {exclude: ['value', 'defaultValue']},
    },
});

export const MinMaxValue = Default.extend({
    render: (args) => (
        <Flex direction="column" gap="2">
            <Text color="secondary">Available from 09:15 to 18:45</Text>
            <TimeSelection
                {...args}
                defaultValue={sampleValue}
                minValue={sampleValue.set({hours: 9, minutes: 15, seconds: 0})}
                maxValue={sampleValue.set({hours: 18, minutes: 45, seconds: 0})}
            />
        </Flex>
    ),
    parameters: {
        controls: {exclude: ['value', 'defaultValue', 'minValue', 'maxValue']},
    },
});

export const Sizes = Default.extend({
    args: {
        views: ['hours', 'minutes', 'seconds'],
    },
    render: (args) => (
        <Flex gap="6" alignItems="flex-start">
            {(['s', 'm', 'l', 'xl'] as const).map((size) => (
                <Flex key={size} direction="column" gap="2">
                    <Text color="secondary">{size}</Text>
                    <TimeSelection
                        {...args}
                        aria-label={`Time, size ${size}`}
                        size={size}
                        defaultValue={sampleValue}
                    />
                </Flex>
            ))}
        </Flex>
    ),
    parameters: {
        controls: {exclude: ['value', 'defaultValue', 'size']},
    },
});

export const Controlled = Default.extend({
    render: function ControlledStory(args) {
        const [value, setValue] = React.useState<DateTime | null>(null);
        return (
            <Flex direction="column" gap="2" alignItems="flex-start">
                <Text>Value: {value ? value.format('YYYY-MM-DD HH:mm:ss') : 'empty'}</Text>
                <Flex gap="2">
                    <Button onClick={() => setValue(dateTime().startOf('minute'))}>Now</Button>
                    <Button onClick={() => setValue(null)}>Clear</Button>
                </Flex>
                <TimeSelection
                    {...args}
                    value={value}
                    onUpdate={(next) => {
                        setValue(next);
                        args.onUpdate?.(next);
                    }}
                />
            </Flex>
        );
    },
    args: {
        views: ['hours', 'minutes', 'seconds'],
    },
    parameters: {
        controls: {exclude: ['value', 'defaultValue']},
    },
});
