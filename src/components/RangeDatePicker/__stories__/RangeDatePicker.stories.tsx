import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import type {Meta, StoryObj} from '@storybook/react';

import {RangeDatePicker} from '../RangeDatePicker';

import './RangeDatePicker.stories.scss';

const meta: Meta<typeof RangeDatePicker> = {
    title: 'Components/RangeDatePicker',
    component: RangeDatePicker,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RangeDatePicker>;

export const Default = {
    render: (args) => {
        const timeZone = args.timeZone;
        const props = {
            ...args,
            minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
            maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
            value: args.value ? parseRangeDateTime(args.value, args.format, timeZone) : undefined,
            defaultValue: args.defaultValue
                ? parseRangeDateTime(args.value, args.format, timeZone)
                : undefined,
            placeholderValue: args.placeholderValue
                ? dateTimeParse(args.placeholderValue, {timeZone})
                : undefined,
        };

        return (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label className="range-date-picker-stories">
                <span style={{marginRight: 4}}>Event date</span>
                <RangeDatePicker {...props} />
            </label>
        );
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'date-picker-on-update-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        <div>
                            date: {res ? res.start.format() + ' - ' + res.end.format() : 'null'}
                        </div>
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
        placeholderValue: {
            control: {
                type: 'text',
            },
        },
        validationState: {
            options: ['invalid', 'none'],
            mapping: {
                none: undefined,
            },
        },
    },
} satisfies Story;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRangeDateTime(text: any, format?: string, timeZone?: string) {
    const list = text.split('-');
    const start = dateTimeParse(list?.[0]?.trim(), {format, timeZone}) ?? dateTime();
    const end = dateTimeParse(list?.[1]?.trim(), {format, timeZone}) ?? dateTime();
    return {start, end};
}
