import {dateTimeParse} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import type {Meta, StoryObj} from '@storybook/react';

import {RelativeRangeDatePicker} from '../RelativeRangeDatePicker';
import type {RelativeRangeDatepickerSingleValue, RelativeRangeDatepickerValue} from '../types';

const meta: Meta<typeof RelativeRangeDatePicker> = {
    title: 'Components/RelativeRangeDatePicker',
    component: RelativeRangeDatePicker,
    tags: ['autodocs'],
};

export default meta;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Story = StoryObj<typeof RelativeRangeDatePicker>;

function getDateLabel(value?: RelativeRangeDatepickerSingleValue) {
    if (!value) return '';
    if (value.type === 'relative') return value.value;
    return value.value.toISOString();
}

function getLabel(value: RelativeRangeDatepickerValue | null) {
    if (!value) return '';
    const startLabel = getDateLabel(value?.start);
    const endLabel = getDateLabel(value?.end);
    if (!startLabel && !endLabel) return '';
    return `${startLabel} — ${endLabel}`;
}

export const Default = {
    render: (args) => {
        const {timeZone} = args;
        const props = {
            ...args,
            minValue: args.minValue ? dateTimeParse(args.minValue, {timeZone}) : undefined,
            maxValue: args.maxValue ? dateTimeParse(args.maxValue, {timeZone}) : undefined,
            label: 'Event date',
            placeholderValue: args.placeholderValue
                ? dateTimeParse(args.placeholderValue, {timeZone})
                : undefined,
        };

        return (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label>
                <RelativeRangeDatePicker
                    {...props}
                    timeZone={timeZone}
                    format={'MM/DD/YYYY HH:mm'}
                    // format={'MM/DD/YYYY'}
                />
            </label>
        );
    },
    args: {
        onUpdate: (value) => {
            toaster.add({
                name: 'calendar-on-change-cb',
                title: 'onUpdate callback',
                type: 'success',
                content: getLabel(value),
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
    },
} satisfies Story;
