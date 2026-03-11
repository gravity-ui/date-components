import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {
    Button,
    Dialog,
    Tab,
    TabList,
    TabPanel,
    TabProvider,
    useControlledState,
} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from 'storybook/actions';

import preview from '#.storybook/preview';

import {timeZoneControl} from '../../../demo/utils/zones';
import {Calendar} from '../../Calendar';
import type {CalendarProps} from '../../Calendar';
import {constrainValue} from '../../utils/dates';
import {RelativeDatePicker} from '../RelativeDatePicker';
import type {Value} from '../hooks/useRelativeDatePickerState';

const meta = preview.meta({
    title: 'Components/RelativeDatePicker',
    component: RelativeDatePicker,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
        onOpenChange: action('onOpenChange'),
    },
});

function stringifyValue(value: Value): string {
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
        return <RelativeDatePicker {...props} minValue={minValue} maxValue={maxValue} />;
    },
    args: {
        onUpdate: (res) => {
            action('onUpdate')(res);
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
});

export const SimpleDatePicker = meta.story({
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
        ...Default.composed.args,
    },
    argTypes: {
        ...Default.composed.argTypes,
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
});

const DefaultComponent = Default.input.render;
Object.assign(DefaultComponent, {displayName: 'RelativeDatePicker'});

function CustomCalendar(props: CalendarProps) {
    const [mode, setMode] = React.useState('days');

    return (
        <TabProvider value={mode} onUpdate={setMode}>
            <TabList style={{paddingInline: 5}}>
                {['days', 'months', 'quarters', 'years'].map((item) => (
                    <Tab key={item} value={item}>
                        {item[0].toUpperCase() + item.slice(1)}
                    </Tab>
                ))}
            </TabList>
            <TabPanel value={mode}>
                <Calendar {...props} modes={{[mode]: true}} />
            </TabPanel>
        </TabProvider>
    );
}
export const WithCustomCalendar = Default.extend({
    args: {
        children: (props) => <CustomCalendar {...props} />,
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
                            <DefaultComponent {...args} />
                        </div>
                    </Dialog.Body>
                </Dialog>
            </React.Fragment>
        );
    },
});
