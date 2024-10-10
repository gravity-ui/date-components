import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import {RelativeRangeDatePicker} from '../../RelativeRangeDatePicker';
import type {RelativeRangeDatePickerValue} from '../../RelativeRangeDatePicker';
import {RangeDateSelection} from '../RangeDateSelection';
import type {ViewportDimensions, ViewportInterval} from '../components/Ruler/Ruler';

const meta: Meta<typeof RangeDateSelection> = {
    title: 'Components/RangeDateSelection',
    component: RangeDateSelection,
    tags: ['autodocs'],
    args: {
        onUpdate: action('onUpdate'),
    },
};

export default meta;

type Story = StoryObj<typeof RangeDateSelection>;

export const Default = {
    render: (args) => {
        const timeZone = args.timeZone;
        const props = {
            ...args,
            minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
            maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
            placeholderValue: args.placeholderValue
                ? dateTimeParse(args.placeholderValue, {timeZone})
                : undefined,
            renderAdditionalRulerContent:
                (args.renderAdditionalRulerContent as unknown as string) === 'fill'
                    ? renderAdditionalRulerContent
                    : undefined,
        };
        return <RangeDateSelection {...props} />;
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
        placeholderValue: {
            control: {
                type: 'text',
            },
        },
        timeZone: timeZoneControl,
        renderAdditionalRulerContent: {
            options: ['none', 'fill'],
            control: {
                type: 'radio',
            },
        },
    },
} satisfies Story;

export const WithControls = {
    ...Default,
    render: function WithControls(args) {
        const timeZone = args.timeZone;
        const minValue = args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined;
        const maxValue = args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined;
        const placeholderValue = args.placeholderValue
            ? dateTimeParse(args.placeholderValue, {timeZone})
            : undefined;

        const [value, setValue] = React.useState<RelativeRangeDatePickerValue>({
            start: {
                type: 'relative',
                value: 'now - 1d',
            },
            end: {
                type: 'relative',
                value: 'now',
            },
        });

        const {start, end} = toAbsoluteRange(value, timeZone);

        const [, rerender] = React.useState({});
        React.useEffect(() => {
            const hasRelative = value.start?.type === 'relative' || value.end?.type === 'relative';
            if (hasRelative) {
                const timer = setInterval(() => {
                    rerender({});
                }, 1000);
                return () => clearInterval(timer);
            }
            return undefined;
        }, [value]);

        return (
            <div>
                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                        paddingBlock: '1rem',
                    }}
                >
                    <RelativeRangeDatePicker
                        style={{width: '20rem'}}
                        value={value}
                        onUpdate={(v) => {
                            if (v) {
                                setValue(v);
                            }
                        }}
                        format="L LTS"
                        withApplyButton
                        withPresets
                        minValue={minValue}
                        maxValue={maxValue}
                        placeholderValue={placeholderValue}
                    />
                    <div style={{display: 'flex', gap: '2px'}}>
                        <Button
                            view="flat"
                            onClick={() => setValue(getRelativeInterval('now - 30m', 'now'))}
                        >
                            30m
                        </Button>
                        <Button
                            view="flat"
                            onClick={() => setValue(getRelativeInterval('now - 1h', 'now'))}
                        >
                            1h
                        </Button>
                        <Button
                            view="flat"
                            onClick={() => setValue(getRelativeInterval('now - 1d', 'now'))}
                        >
                            1d
                        </Button>
                        <Button
                            view="flat"
                            onClick={() => setValue(getRelativeInterval('now - 1w', 'now'))}
                        >
                            1w
                        </Button>
                    </div>
                </div>
                <RangeDateSelection
                    {...args}
                    value={{start, end}}
                    onUpdate={(value) => {
                        setValue({
                            start: {type: 'absolute', value: value.start},
                            end: {type: 'absolute', value: value.end},
                        });
                    }}
                    minValue={minValue}
                    maxValue={maxValue}
                    placeholderValue={placeholderValue}
                />
            </div>
        );
    },
} satisfies Story;

function getRelativeInterval(start: string, end: string): RelativeRangeDatePickerValue {
    return {
        start: {type: 'relative', value: start},
        end: {type: 'relative', value: end},
    };
}

function toAbsoluteRange(interval: RelativeRangeDatePickerValue, timeZone?: string) {
    const start: DateTime =
        interval.start?.type === 'relative'
            ? dateTimeParse(interval.start.value, {timeZone})!
            : interval.start!.value;

    const end: DateTime =
        interval.end?.type === 'relative'
            ? dateTimeParse(interval.end.value, {roundUp: true, timeZone})!
            : interval.end!.value;

    return {start, end};
}

function renderAdditionalRulerContent(props: {
    interval: ViewportInterval;
    dimensions: ViewportDimensions;
}) {
    const {width, height} = props.dimensions;
    return (
        <React.Fragment>
            {Array.from({length: 12}, (_, i) => (
                <path
                    key={i}
                    d={`M${(i * width) / 12},0l${width / 12},0l0,${height}l${-width / 12},0`}
                    fill={`hsl(${i * 30}, 100%, 50%)`}
                    fillOpacity={0.05}
                />
            ))}
        </React.Fragment>
    );
}
