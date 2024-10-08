import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {Button, Dialog} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import type {Value} from '../../RelativeDatePicker';
import {RelativeRangeDatePicker} from '../RelativeRangeDatePicker';
import type {RelativeRangeDatePickerProps} from '../types';

const meta: Meta<typeof RelativeRangeDatePicker> = {
    title: 'Components/RelativeRangeDatePicker',
    component: RelativeRangeDatePicker,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
        onOpenChange: action('onOpenChange'),
    },
};

export default meta;

type Story = StoryObj<typeof RelativeRangeDatePicker>;

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
        timeZone: timeZoneControl,
    },
} satisfies Story;

export const InsideDialog: StoryObj<
    RelativeRangeDatePickerProps & {disableDialogFocusTrap?: boolean}
> = {
    ...Default,
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
                <Dialog
                    open={isOpen}
                    onClose={() => setOpen(false)}
                    disableFocusTrap={args.disableDialogFocusTrap}
                >
                    <Dialog.Header />
                    <Dialog.Body>
                        <div style={{paddingTop: 16}}>{Default.render(args)}</div>
                    </Dialog.Body>
                </Dialog>
            </React.Fragment>
        );
    },
    argTypes: {
        disableDialogFocusTrap: {
            control: {
                type: 'boolean',
            },
        },
    },
};

export const CustomControl: StoryObj<RelativeRangeDatePickerProps> = {
    ...Default,
    args: {
        ...Default.args,
        style: undefined,
    },
    render: (props) => {
        return (
            <RelativeRangeDatePicker
                {...props}
                renderControl={({title, triggerProps, ref}) => {
                    return (
                        <Button ref={ref} {...triggerProps} extraProps={triggerProps}>
                            {title || 'Not selected'}
                        </Button>
                    );
                }}
            />
        );
    },
};
