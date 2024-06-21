'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon, Clock as ClockIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {RangeCalendar} from '../Calendar';
import type {DatePickerProps} from '../DatePicker';
import {StubButton} from '../DatePicker/StubButton';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import {RangeDateField} from '../RangeDateField';
import type {RangeValue} from '../types';

import {useRangeDatePickerProps} from './hooks/useRangeDatePickerProps';
import {useRangeDatePickerState} from './hooks/useRangeDatePickerState';

import './RangeDatePicker.scss';

const b = block('range-date-picker');

export type RangeDatePickerProps = DatePickerProps<RangeValue<DateTime>>;

export function RangeDatePicker({className, ...props}: RangeDatePickerProps) {
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const state = useRangeDatePickerState(props);

    const {groupProps, fieldProps, calendarButtonProps, popupProps, calendarProps, timeInputProps} =
        useRangeDatePickerProps(state, props);

    const isOnlyTime = state.hasTime && !state.hasDate;

    return (
        <div className={b(null, className)} {...groupProps}>
            {!isOnlyTime && (
                <div ref={anchorRef} className={b('popup-anchor')}>
                    <Popup anchorRef={anchorRef} {...popupProps}>
                        <div className={b('popup-content')}>
                            {typeof props.children === 'function' ? (
                                props.children({...calendarProps, value: state.value})
                            ) : (
                                <RangeCalendar {...calendarProps} />
                            )}
                            {state.hasTime && (
                                <div className={b('time-field-wrapper')}>
                                    <RangeDateField {...timeInputProps} />
                                </div>
                            )}
                        </div>
                    </Popup>
                </div>
            )}
            <TextInput
                {...fieldProps}
                className={b('field')}
                hasClear={fieldProps.hasClear}
                endContent={
                    <React.Fragment>
                        {!isOnlyTime && (
                            <Button {...calendarButtonProps}>
                                <Icon data={CalendarIcon} />
                            </Button>
                        )}
                        {isOnlyTime && (
                            <StubButton size={calendarButtonProps.size} icon={ClockIcon} />
                        )}
                    </React.Fragment>
                }
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                onReset={(v) => {
                    state.dateFieldState.setDate(v);
                }}
                value={state.value}
                toStringValue={(v) => (v ? v.start.toISOString() : '')}
                disabled={state.disabled}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                value={state.value}
                toStringValue={(v) => (v ? v.end.toISOString() : '')}
                disabled={state.disabled}
            />
        </div>
    );
}
