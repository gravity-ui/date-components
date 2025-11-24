import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {Button, Dialog, Text} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from 'storybook/actions';

import preview from '#.storybook/preview';

import {timeZoneControl} from '../../../demo/utils/zones';
import type {Value} from '../../RelativeDatePicker';
import {RelativeRangeDatePicker} from '../RelativeRangeDatePicker';

const meta = preview.meta({
    title: 'Components/RelativeRangeDatePicker',
    component: RelativeRangeDatePicker,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
        onOpenChange: action('onOpenChange'),
    },
});

function stringifyValue(value: Value | null): string {
    if (!value) {
        return 'null';
    }

    if (value.type === 'relative') {
        return JSON.stringify(value, null, 2);
    }

    return JSON.stringify({...value, value: value.value.format()}, null, 2);
}

export const Default = meta.story({
    render: (props) => {
        const timeZone = props.timeZone;
        const minValue = props.minValue ? dateTimeParse(props.minValue, {timeZone}) : undefined;
        const maxValue = props.maxValue ? dateTimeParse(props.maxValue, {timeZone}) : undefined;

        return <RelativeRangeDatePicker {...props} minValue={minValue} maxValue={maxValue} />;
    },
    args: {
        onUpdate: (res, timeZone) => {
            action('onUpdate')(res);
            toaster.add({
                name: 'on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        value:
                        {res ? (
                            <Text as="code" variant="code-1">
                                <pre>
                                    {`start: ${stringifyValue(res.start)}\nend: ${stringifyValue(res.end)}\n${timeZone}`}
                                </pre>
                            </Text>
                        ) : (
                            ' null'
                        )}
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
        timeZone: timeZoneControl,
    },
});

export const InsideDialog = Default.extend({
    render: function InsideDialog(args) {
        const [isOpen, setOpen] = React.useState(false);
        return (
            <React.Fragment>
                <Button
                    onClick={() => {
                        setOpen(true);
                    }}
                >
                    Open dialog
                </Button>
                <Dialog open={isOpen} onClose={() => setOpen(false)}>
                    <Dialog.Header />
                    <Dialog.Body>
                        <div style={{paddingTop: 16}}>
                            <Default.Component {...args} />
                        </div>
                    </Dialog.Body>
                </Dialog>
            </React.Fragment>
        );
    },
});

export const CustomControl = Default.extend({
    args: {
        style: undefined,
    },
    render: (props) => {
        return (
            <Default.Component
                {...props}
                renderControl={({title, triggerProps, ref}) => {
                    return (
                        <Button ref={ref as React.Ref<HTMLButtonElement>} {...triggerProps}>
                            {title || 'Not selected'}
                        </Button>
                    );
                }}
            />
        );
    },
});

export const CustomPresets = Default.extend({
    args: {
        withPresets: true,
        presetTabs: [
            {
                id: 'my-presets',
                title: 'My Presets',
                presets: [
                    {to: 'now', from: 'now-5d', title: 'Last five days'},
                    {to: 'now', from: 'now-5w', title: 'Last five weeks'},
                    {to: 'now', from: 'now-5M', title: 'Last five months'},
                    {to: 'now', from: 'now-5Q', title: 'Last five quarters'},
                    {to: 'now', from: 'now-5y', title: 'Last five years'},
                ],
            },
        ],
    },
});
