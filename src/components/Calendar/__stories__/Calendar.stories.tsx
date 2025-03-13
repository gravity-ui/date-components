import React from 'react';

import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Flex, Select, Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import {
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarGridHeaderCell,
    CalendarGridHeaderCells,
    CalendarGridRow,
    CalendarGridRowCells,
    CalendarGridRowHeader,
} from '../../CalendarView/CalendarView';
import {Button} from '../../common/Button';
import {Text} from '../../common/Text';
import {Calendar} from '../Calendar';
import type {CalendarProps} from '../Calendar';

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
        return <Calendar {...prepareStoryProps(args)} />;
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
                    (date.isSame(interval[0], 'day') || date.isAfter(interval[0])) &&
                    (date.isSame(interval[1], 'day') || date.isBefore(interval[1])),
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
                    <Calendar {...prepareStoryProps(args)} modes={{[mode]: true}}>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Button slot="previous" view="outlined" />
                            <Text slot="heading" />
                            <Button slot="next" view="outlined" />
                        </Flex>
                        <CalendarGrid />
                    </Calendar>
                </TabPanel>
            </TabProvider>
        );
    },
    parameters: {
        controls: {exclude: ['mode', 'defaultMode', 'modes']},
    },
};

export const CustomDay = {
    ...Default,
    render: (args) => {
        return (
            <Calendar
                {...prepareStoryProps(args)}
                style={{
                    '--g-date-calendar-grid-columns': 8,
                }}
            >
                <Text slot="heading" style={{textAlign: 'center'}} />
                <Flex justifyContent="center">
                    <Button slot="mode" />
                </Flex>
                <Flex direction="row" gap={2} alignItems="center">
                    <Button
                        slot="previous"
                        style={{height: 'var(--_--calendar-grid-height)', alignItems: 'center'}}
                    />
                    <CalendarGrid>
                        <CalendarGridHeader>
                            <div
                                style={{
                                    alignSelf: 'center',
                                    justifySelf: 'end',
                                    paddingInlineEnd: 10,
                                }}
                            >
                                #
                            </div>
                            <CalendarGridHeaderCells>
                                {(date) => <CalendarGridHeaderCell date={date} />}
                            </CalendarGridHeaderCells>
                        </CalendarGridHeader>
                        <CalendarGridBody>
                            <CalendarGridRow>
                                <CalendarGridRowHeader
                                    style={{justifySelf: 'end', paddingInlineEnd: 10}}
                                >
                                    {({days}) => days[0].format('W')}
                                </CalendarGridRowHeader>
                                <CalendarGridRowCells>
                                    {(date) => (
                                        <CalendarCell
                                            date={date}
                                            style={({
                                                isCurrent,
                                                isSelected,
                                                isWeekend,
                                                mode,
                                                isOutsideCurrentRange,
                                            }) => ({
                                                color:
                                                    isCurrent && mode === 'days'
                                                        ? 'var(--g-color-text-info)'
                                                        : isWeekend
                                                          ? 'var(--g-color-text-brand)'
                                                          : undefined,
                                                background:
                                                    isCurrent && mode === 'days'
                                                        ? `repeating-linear-gradient(45deg, var(--g-color-base-info-light), var(--g-color-base-info-light) 2px, transparent 2px, transparent 6px)${isSelected ? ', var(--g-color-base-selection)' : ''}`
                                                        : undefined,
                                                opacity: isOutsideCurrentRange ? 0 : undefined,
                                                pointerEvents: isOutsideCurrentRange
                                                    ? 'none'
                                                    : undefined,
                                            })}
                                        />
                                    )}
                                </CalendarGridRowCells>
                            </CalendarGridRow>
                        </CalendarGridBody>
                    </CalendarGrid>
                    <Button
                        slot="next"
                        style={{height: 'var(--_--calendar-grid-height)', alignItems: 'center'}}
                    />
                </Flex>
            </Calendar>
        );
    },
} satisfies Story;

function prepareStoryProps(args: CalendarProps) {
    const timeZone = args.timeZone;
    const props = {
        ...args,
        minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
        maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
        value: args.value ? dateTimeParse(args.value, {timeZone}) : undefined,
        defaultValue: args.defaultValue ? dateTimeParse(args.defaultValue, {timeZone}) : undefined,
        focusedValue: args.focusedValue ? dateTimeParse(args.focusedValue, {timeZone}) : undefined,
        defaultFocusedValue: args.defaultFocusedValue
            ? dateTimeParse(args.defaultFocusedValue, {timeZone})
            : undefined,
        isDateUnavailable: getIsDateUnavailable(args.isDateUnavailable as unknown as string),
        isWeekend: getIsWeekend(args.isWeekend as unknown as string),
    };
    return props;
}

export const Showcase = {
    ...Default,
    render: function Showcase(args) {
        const [focusedDate, setFocusedDate] = React.useState<DateTime>(dateTime());
        return (
            <Calendar
                style={{'--g-date-calendar-grid-columns': 8}}
                {...prepareStoryProps(args)}
                focusedValue={focusedDate}
                onFocusUpdate={setFocusedDate}
                mode="days"
                modes={{days: true}}
            >
                <Text slot="heading" style={{textAlign: 'center'}} />
                <Flex justifyContent="space-between" alignItems="center" gap={2}>
                    <Button slot="previous" view="outlined" />
                    <Flex style={{flex: '1 1 0'}}>
                        <Select
                            size={args.size}
                            disabled={args.disabled}
                            value={[String(focusedDate.month())]}
                            onUpdate={([value]) => setFocusedDate(focusedDate.month(Number(value)))}
                            width="max"
                        >
                            {[...new Array(12)].map((_, index) => (
                                <Select.Option key={index} value={`${index}`}>
                                    {dateTime().month(index).format('MMMM')}
                                </Select.Option>
                            ))}
                        </Select>
                    </Flex>
                    <Select
                        size={args.size}
                        disabled={args.disabled}
                        value={[String(focusedDate.year())]}
                        onUpdate={([value]) => setFocusedDate(focusedDate.year(Number(value)))}
                        width={75}
                    >
                        {[...new Array(100)].map((_, index) => (
                            <Select.Option value={`${1970 + index}`} key={index}>
                                {1970 + index}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button slot="next" view="outlined" />
                </Flex>
                <CalendarGrid disableAnimation>
                    <CalendarGridHeader>
                        <div
                            role="columnheader"
                            style={{
                                alignSelf: 'center',
                                justifySelf: 'center',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    right: -10,
                                    top: -8,
                                    height: 'calc(var(--_--calendar-grid-height) - 10px)',
                                    width: 2,
                                    background: 'var(--g-color-line-generic)',
                                }}
                            />
                            #
                        </div>
                        <CalendarGridHeaderCells>
                            {(date) => (
                                <CalendarGridHeaderCell date={date}>
                                    {date.format('ddd')}
                                </CalendarGridHeaderCell>
                            )}
                        </CalendarGridHeaderCells>
                    </CalendarGridHeader>
                    <CalendarGridBody>
                        <CalendarGridRow>
                            <CalendarGridRowHeader style={{justifySelf: 'center'}}>
                                {({days}) => days[0].format('W')}
                            </CalendarGridRowHeader>
                            <CalendarGridRowCells>
                                {(date) => <CalendarCell date={date} />}
                            </CalendarGridRowCells>
                        </CalendarGridRow>
                    </CalendarGridBody>
                </CalendarGrid>
            </Calendar>
        );
    },
} satisfies Story;
