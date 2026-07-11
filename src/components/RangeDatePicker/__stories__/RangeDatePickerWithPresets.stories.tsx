import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {Flex, Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {action} from 'storybook/actions';

import {RangeCalendar} from '../../Calendar';
import {RangeDatePicker} from '../RangeDatePicker';

import {Default} from './RangeDatePicker.stories';

import './RangeDatePickerWithPresets.scss';

const meta: Meta<typeof RangeDatePicker> = {
    title: 'Components/RangeDatePicker',
    component: RangeDatePicker,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
};

export default meta;

type Story = StoryObj<typeof RangeDatePicker>;

type DurationUnit = 'days' | 'months' | 'quarters' | 'years';
type DurationRange = {start: string; end: string};

type DateRandgeMode = {id: DurationUnit; title: string};

const DATE_RANGE_MODES: DateRandgeMode[] = [
    {id: 'days', title: 'Day'},
    {id: 'months', title: 'Month'},
    {id: 'quarters', title: 'Quarter'},
    {id: 'years', title: 'Year'},
];

type DateRangePreset = {
    [key in DurationUnit]: Array<{
        title: string;
        value: DurationRange;
    }>;
};

const DATE_RANGE_PRESETS: DateRangePreset = {
    days: [
        {title: '7 days', value: {start: 'now-7d', end: 'now'}},
        {title: '30 days', value: {start: 'now-30d', end: 'now'}},
        {title: '90 days', value: {start: 'now-90d', end: 'now'}},
        {
            title: '365 days',
            value: {start: 'now-365d', end: 'now'},
        },
    ],
    months: [
        {
            title: 'Past',
            value: {start: 'now-1M/M', end: 'now-1M/M+1M-1d'},
        },
        {
            title: 'Current',
            value: {start: 'now/M', end: 'now/M+1M-1d'},
        },
    ],
    quarters: [
        {
            title: 'Past',
            value: {start: 'now-1Q/Q', end: 'now-1Q/Q+1Q-1d'},
        },
        {
            title: 'Current',
            value: {start: 'now/Q', end: 'now/Q+1Q-1d'},
        },
    ],
    years: [
        {
            title: 'Past',
            value: {start: 'now-1y/y', end: 'now-1y/y+1y-1d'},
        },
        {
            title: 'Current',
            value: {start: 'now/y', end: 'now/y+1y-1d'},
        },
    ],
};

export const WithPresets = {
    ...Default,
    render: function WithPresets(args) {
        const [mode, setMode] = React.useState<DurationUnit>('days');

        return (
            <div>
                {Default.render({
                    ...args,
                    children: (props) => (
                        <TabProvider
                            value={mode}
                            onUpdate={(value) => setMode(value as DurationUnit)}
                        >
                            <TabList className="g-date-range-date-picker-with-preset__tabs">
                                {DATE_RANGE_MODES.map(({id, title}) => (
                                    <Tab key={id} value={id}>
                                        {title}
                                    </Tab>
                                ))}
                            </TabList>
                            <TabPanel value={mode}>
                                <Flex>
                                    {DATE_RANGE_PRESETS[mode].map(({title, value}) => (
                                        <button
                                            key={`${mode}-${value.start}`}
                                            className="g-date-range-date-picker-with-preset__range"
                                            onClick={() => {
                                                const start = dateTimeParse(value.start)?.startOf(
                                                    'day',
                                                );
                                                const end = dateTimeParse(value.end)?.endOf('day');

                                                if (start && end) {
                                                    props.onUpdate?.({
                                                        start,
                                                        end,
                                                    });
                                                }
                                            }}
                                        >
                                            {title}
                                        </button>
                                    ))}
                                </Flex>
                                <RangeCalendar {...props} modes={{[mode]: true}} />
                            </TabPanel>
                        </TabProvider>
                    ),
                })}
            </div>
        );
    },
} satisfies Story;
