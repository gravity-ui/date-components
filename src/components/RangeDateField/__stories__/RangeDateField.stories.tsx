import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import {RangeDateField} from '../RangeDateField';

import './RangeDateField.stories.scss';

const meta: Meta<typeof RangeDateField> = {
    title: 'Components/RangeDateField',
    component: RangeDateField,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
};

export default meta;

type Story = StoryObj<typeof RangeDateField>;

export const Default = {
    render: (args) => {
        const timeZone = args.timeZone;
        const props = {
            ...args,
            minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
            maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
            value: args.value ? parseRangeDateTime(args.value, args.format, timeZone) : undefined,
            defaultValue: args.defaultValue
                ? parseRangeDateTime(args.defaultValue, args.format, timeZone)
                : undefined,
            placeholderValue: args.placeholderValue
                ? dateTimeParse(args.placeholderValue, {timeZone})
                : undefined,
        };

        return (
            <div className="range-date-field-stories">
                <RangeDateField {...props} />
            </div>
        );
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'date-field-on-update-cb',
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
        timeZone: timeZoneControl,
    },
} satisfies Story;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRangeDateTime(text: any, format?: string, timeZone?: string) {
    const list = text.split('-');
    const start = dateTimeParse(list?.[0]?.trim(), {format, timeZone}) ?? dateTime();
    const end = dateTimeParse(list?.[1]?.trim(), {format, timeZone}) ?? dateTime();
    return {start, end};
}
