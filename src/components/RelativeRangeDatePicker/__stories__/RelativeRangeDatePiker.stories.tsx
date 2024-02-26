import {dateTime, dateTimeParse, getTimeZonesList} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import type {Meta, StoryObj} from '@storybook/react';

import type {Value} from '../../RelativeDatePicker';
import {RelativeRangeDatePicker} from '../RelativeRangeDatePicker';

const meta: Meta<typeof RelativeRangeDatePicker> = {
    title: 'Components/RelativeRangeDatePicker',
    component: RelativeRangeDatePicker,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RelativeRangeDatePicker>;

const zones = getTimeZonesList().reduce<Record<string, string>>((l, zone) => {
    l[zone] = `${zone} (UTC ${dateTime({timeZone: zone}).format('Z')})`;
    return l;
}, {});

function stringifyValue(value: Value | null): string {
    if (!value) {
        return 'null';
    }

    if (value.type === 'relative') {
        return JSON.stringify(value, null, 2);
    }

    return JSON.stringify({...value, value: value.value.format()}, null, 2);
}

export const Default = {
    render: (props) => {
        const timeZone = props.timeZone;
        const minValue = props.minValue ? dateTimeParse(props.minValue, {timeZone}) : undefined;
        const maxValue = props.maxValue ? dateTimeParse(props.maxValue, {timeZone}) : undefined;

        return <RelativeRangeDatePicker {...props} minValue={minValue} maxValue={maxValue} />;
    },
    args: {
        onUpdate: (res, timeZone) => {
            toaster.add({
                name: 'on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        <div>
                            value:{' '}
                            {res
                                ? `{start: ${stringifyValue(res.start)}, end: ${stringifyValue(res.end)}}, ${timeZone}`
                                : 'null'}
                        </div>
                    </div>
                ),
            });
        },
        style: {width: 326},
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
        validationState: {
            options: ['invalid', 'none'],
            mapping: {
                none: undefined,
            },
        },
        timeZone: {
            options: ['none', ...Object.keys(zones)],
            mapping: {
                none: undefined,
            },
            control: {
                type: 'select',
                labels: zones,
            },
        },
    },
} satisfies Story;
