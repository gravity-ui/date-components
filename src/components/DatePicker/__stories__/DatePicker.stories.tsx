import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {Button, Dialog, Tabs} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import {Calendar} from '../../Calendar';
import {DatePicker} from '../DatePicker';

const meta: Meta<typeof DatePicker> = {
    title: 'Components/DatePicker',
    component: DatePicker,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default = {
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
        return (
            <label htmlFor={props.id}>
                <span style={{marginInlineEnd: 4}}>Event date</span>
                <DatePicker {...props} />
            </label>
        );
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'date-picker-on-change-cb',
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
} satisfies Story;

export const WithCustomCalendar = {
    ...Default,
    render: (args) => {
        return Default.render({
            ...args,
            children: function CustomCalendar(props) {
                const [mode, setMode] = React.useState('days');

                return (
                    <div>
                        <div style={{paddingInline: 5}}>
                            <Tabs
                                activeTab={mode}
                                onSelectTab={(id) => {
                                    setMode(id);
                                }}
                                items={['days', 'months', 'quarters', 'years'].map((item) => ({
                                    id: item,
                                    title: item[0].toUpperCase() + item.slice(1, -1),
                                }))}
                            />
                        </div>
                        <Calendar {...props} modes={{[mode]: true}} />
                    </div>
                );
            },
        });
    },
} satisfies Story;

export const InsideDialog = {
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
                <Dialog open={isOpen} onClose={() => setOpen(false)}>
                    <Dialog.Header />
                    <Dialog.Body>
                        <div style={{paddingTop: 16}}>{Default.render(args)}</div>
                    </Dialog.Body>
                </Dialog>
            </React.Fragment>
        );
    },
} satisfies Story;

export const ControlledOpenState = {
    ...Default,
    render: function ControlledOpenState(args) {
        const [open, onOpenChange] = React.useState(false);
        return (
            <div>
                {Default.render({
                    ...args,
                    disableFocusTrap: true,
                    open,
                    onOpenChange: (newOpen, reason) => {
                        if (reason !== 'ClickOutside') {
                            onOpenChange(newOpen);
                        }
                    },
                    onFocus: (e) => {
                        if (e.target.nodeName !== 'BUTTON') {
                            onOpenChange(true);
                        }
                    },
                    onBlur: () => {
                        onOpenChange(false);
                    },
                    children: (props) => <Calendar {...props} autoFocus={false} />,
                })}
            </div>
        );
    },
} satisfies Story;
