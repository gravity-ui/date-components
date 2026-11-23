import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import {Flex, Text} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from 'storybook/actions';

import preview from '#.storybook/preview';

import {timeZoneControl} from '../../../demo/utils/zones';
import {TimeSelection} from '../TimeSelection';
import type {TimeSelectionView} from '../types';

const meta = preview.meta({
    title: 'Components/TimeSelection',
    component: TimeSelection,
    tags: ['autodocs'],
    args: {
        'aria-label': 'Time',
        onFocusViewUpdate: action('onFocusViewUpdate'),
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
});

// The sets of columns that make sense together: a control of independent checkboxes would also
// offer an empty set and hours with seconds but without minutes
const VIEWS_PRESETS: Record<string, TimeSelectionView[]> = {
    hours: ['hours'],
    'hours, minutes': ['hours', 'minutes'],
    'hours, minutes, seconds': ['hours', 'minutes', 'seconds'],
    'hours, minutes, seconds, milliseconds': ['hours', 'minutes', 'seconds', 'milliseconds'],
    'minutes, seconds': ['minutes', 'seconds'],
};

/** An arg of the `views` control is the name of a preset, mapped to the list by Storybook */
function viewsPreset(name: keyof typeof VIEWS_PRESETS) {
    return name as unknown as TimeSelectionView[];
}

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
    args: {
        views: viewsPreset('hours, minutes'),
        onUpdate: (res) => {
            action('onUpdate')(res);
            toaster.add({
                name: 'time-selection-on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        <div>date: {res.format('YYYY-MM-DDTHH:mm:ss.SSSZ')}</div>
                    </div>
                ),
            });
        },
    },
    argTypes: {
        value: {control: {type: 'text'}},
        defaultValue: {control: {type: 'text'}},
        placeholderValue: {control: {type: 'text'}},
        minValue: {control: {type: 'text'}},
        maxValue: {control: {type: 'text'}},
        views: {
            options: Object.keys(VIEWS_PRESETS),
            mapping: VIEWS_PRESETS,
            control: {type: 'radio'},
        },
        size: {
            options: ['s', 'm', 'l', 'xl'],
            control: {type: 'radio'},
        },
        timeZone: timeZoneControl,
    },
});

const sampleValue = dateTime({input: '2024-01-15T10:30:45'});

export const Steps = Default.extend({
    args: {
        views: viewsPreset('hours, minutes, seconds, milliseconds'),
        timeSteps: {hours: 2, minutes: 5, seconds: 15, milliseconds: 100},
    },
    render: (args) => <TimeSelection {...args} defaultValue={sampleValue} />,
    parameters: {
        controls: {exclude: ['value', 'defaultValue', 'maxValue', 'minValue', 'placeholderValue']},
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
        controls: {
            exclude: ['value', 'defaultValue', 'maxValue', 'minValue', 'placeholderValue'],
        },
    },
});
