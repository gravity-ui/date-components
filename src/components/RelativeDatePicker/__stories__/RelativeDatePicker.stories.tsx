import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {Button, Dialog, Tabs, useControlledState} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import {action} from '@storybook/addon-actions';
import type {Meta, StoryObj} from '@storybook/react';

import {timeZoneControl} from '../../../demo/utils/zones';
import {Calendar} from '../../Calendar';
import {constrainValue} from '../../utils/dates';
import {RelativeDatePicker} from '../RelativeDatePicker';
import type {RelativeDatePickerProps} from '../RelativeDatePicker';
import type {Value} from '../hooks/useRelativeDatePickerState';

const meta: Meta<typeof RelativeDatePicker> = {
    title: 'Components/RelativeDatePicker',
    component: RelativeDatePicker,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
        onOpenChange: action('onOpenChange'),
    },
};

export default meta;

type Story = StoryObj<typeof RelativeDatePicker>;

function stringifyValue(value: Value): string {
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
        return <RelativeDatePicker {...props} minValue={minValue} maxValue={maxValue} />;
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
                content: (
                    <div>
                        <div>value: {res ? stringifyValue(res) : 'null'}</div>
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
        validationState: {
            options: ['invalid', 'none'],
            mapping: {
                none: undefined,
            },
        },
        timeZone: timeZoneControl,
    },
} satisfies Story;

export const SimpleDatePicker: Story = {
    render: function SimpleDatePicker({value, defaultValue, onUpdate, ...props}) {
        const timeZone = props.timeZone;
        const minValue = props.minValue ? dateTimeParse(props.minValue, {timeZone}) : undefined;
        const maxValue = props.maxValue ? dateTimeParse(props.maxValue, {timeZone}) : undefined;

        const [innerValue, setInnerValue] = React.useState<Value | null>(
            (value === undefined ? defaultValue : value) ?? null,
        );
        const [val, setVal] = useControlledState(value, defaultValue ?? null, onUpdate);
        const [prev, setPrev] = React.useState<Value | null | undefined>(val);
        if (val !== prev) {
            setPrev(val);
            setInnerValue(val ?? null);
        }

        const handleBlur = () => {
            if (innerValue === (val ?? null)) {
                return;
            }

            if (!minValue && !maxValue) {
                setVal(innerValue ?? null);
            }

            if (innerValue) {
                if (innerValue.type === 'absolute') {
                    const date = constrainValue(innerValue.value, minValue, maxValue);
                    setVal({type: 'absolute', value: date});
                } else {
                    const parsedDate = dateTimeParse(innerValue.value, {timeZone: props.timeZone});
                    if (parsedDate) {
                        const date = constrainValue(parsedDate, minValue, maxValue);
                        if (date.isSame(parsedDate)) {
                            setVal(innerValue);
                        } else {
                            setVal({type: 'absolute', value: date});
                        }
                    } else {
                        setVal(innerValue);
                    }
                }
            } else {
                setVal(null);
            }
        };

        return (
            <RelativeDatePicker
                {...props}
                value={innerValue}
                onUpdate={setInnerValue}
                onBlur={handleBlur}
            />
        );
    },
    args: {
        ...Default.args,
    },
    argTypes: {
        ...Default.argTypes,
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
    },
};

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

export const InsideDialog: StoryObj<RelativeDatePickerProps & {disableDialogFocusTrap?: boolean}> =
    {
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
