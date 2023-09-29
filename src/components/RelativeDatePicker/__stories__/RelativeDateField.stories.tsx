import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import type {Meta, StoryObj} from '@storybook/react';

import {constrainValue} from '../../Calendar/utils.js';
import {useControlledState} from '../../hooks/useControlledState.js';
import {RelativeDatePicker} from '../RelativeDatePicker.js';
import type {Value} from '../hooks/useRelativeDatePickerState.js';

const meta: Meta<typeof RelativeDatePicker> = {
    title: 'Components/RelativeDatePicker',
    component: RelativeDatePicker,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RelativeDatePicker>;

export const Default: Story = {
    render: (props) => {
        return <RelativeDatePicker {...props} />;
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'on-change-cb',
                title: 'onUpdate callback',
                type: 'success',
                content: (
                    <div>
                        <div>value: {res ? JSON.stringify(res, null, 2) : 'null'}</div>
                    </div>
                ),
            });
        },
    },
    argTypes: {
        validationState: {
            options: ['invalid', 'none'],
            mapping: {
                none: undefined,
            },
        },
    },
};

export const SimpleDatePicker: Story = {
    render: function SimpleDatePicker({value, defaultValue, onUpdate, ...props}) {
        const timeZone = props.timeZone;
        const minValue = props.minValue ? dateTimeParse(props.minValue, {timeZone}) : undefined;
        const maxValue = props.maxValue ? dateTimeParse(props.maxValue, {timeZone}) : undefined;

        const [innerValue, setInnerValue] = React.useState<Value | null>(
            (value === undefined ? defaultValue : value) ?? null,
        );
        const [val, setVal] = useControlledState(value, defaultValue, onUpdate);
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
