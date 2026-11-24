'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon, Clock as ClockIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {RangeCalendar} from '../Calendar';
import {useDatePickerProps} from '../DatePicker';
import type {DatePickerProps} from '../DatePicker';
import {StubButton} from '../DatePicker/StubButton';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import {PickerPopupContent} from '../PickerPopupContent/PickerPopupContent';
import {RangeDateField} from '../RangeDateField';
import type {RangeValue} from '../types';

import {useRangeDatePickerState} from './hooks/useRangeDatePickerState';

import './RangeDatePicker.scss';

const b = block('range-date-picker');

export type RangeDatePickerProps = DatePickerProps<RangeValue<DateTime>>;

export function RangeDatePicker({className, ...props}: RangeDatePickerProps) {
    const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);

    const state = useRangeDatePickerState(props);

    const {groupProps, fieldProps, calendarButtonProps, popupProps, calendarProps, timeInputProps} =
        useDatePickerProps(state, props);

    const isOnlyTime = state.formatInfo.hasTime && !state.formatInfo.hasDate;

    return (
        <div className={b(null, className)} {...groupProps}>
            {!isOnlyTime && (
                <div ref={setAnchor} className={b('popup-anchor')}>
                    <Popup anchorElement={anchor} {...popupProps}>
                        <PickerPopupContent
                            className={b('popup-content')}
                            timePanel={
                                state.formatInfo.hasTime ? (
                                    <RangeDateField {...timeInputProps} />
                                ) : null
                            }
                            timePanelClassName={b('time-field-wrapper')}
                        >
                            {typeof props.children === 'function' ? (
                                props.children({...calendarProps, value: state.value})
                            ) : (
                                <RangeCalendar {...calendarProps} value={state.value} />
                            )}
                        </PickerPopupContent>
                    </Popup>
                </div>
            )}
            <TextInput
                {...fieldProps}
                className={b('field')}
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
                    state.dateFieldState.setValue(v);
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
