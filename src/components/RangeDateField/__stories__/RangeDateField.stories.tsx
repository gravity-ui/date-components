import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from 'storybook/actions';

import preview from '#.storybook/preview';

import {timeZoneControl} from '../../../demo/utils/zones';
import {RangeDateField} from '../RangeDateField';

const meta = preview.meta({
    title: 'Components/RangeDateField',
    component: RangeDateField,
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
            value: args.value ? parseRangeDateTime(args.value, timeZone) : undefined,
            defaultValue: args.defaultValue
                ? parseRangeDateTime(args.defaultValue, timeZone)
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
            action('onUpdate')(res);
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
        style: {width: 300},
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
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRangeDateTime(text: any, timeZone?: string) {
    const list = text.split('-');
    const start = dateTimeParse(list?.[0]?.trim(), {timeZone}) ?? dateTime();
    const end = dateTimeParse(list?.[1]?.trim(), {timeZone}) ?? dateTime();
    return {start, end};
}
