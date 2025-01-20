import {dateTimeParse} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import {DateField} from '../DateField';

const meta: Meta<typeof DateField> = {
    title: 'Components/DateField',
    component: DateField,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
};

export default meta;

type Story = StoryObj<typeof DateField>;

export const Default: Story = {
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
            placeholderValue: args.placeholderValue
                ? dateTimeParse(args.placeholderValue, {timeZone})
                : undefined,
        };
        return <DateField {...props} />;
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'calendar-on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        <div>date: {res?.format() || 'null'}</div>
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
};

export const TimeField: Story = {
    ...Default,
    args: {
        ...Default.args,
        format: 'LTS',
    },
    argTypes: {
        ...Default.argTypes,
        format: {
            type: {name: 'enum', value: ['LTS', 'LT', 'HH:mm', 'hh:mm a']},
        },
    },
};
