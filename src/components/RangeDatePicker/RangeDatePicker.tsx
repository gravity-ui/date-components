import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon, Clock as ClockIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, TextInput, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {RangeCalendar} from '../Calendar';
import {useDatePickerProps} from '../DatePicker';
import type {DatePickerProps} from '../DatePicker';
import {StubButton} from '../DatePicker/StubButton';
import {RangeDateField} from '../RangeDateField';
import type {RangeValue} from '../types';

import {useRangeDatePickerState} from './hooks/useRangeDatePickerState';

import './RangeDatePicker.scss';

const b = block('range-date-picker');

export type RangeDatePickerProps = DatePickerProps<RangeValue<DateTime>>;

export function RangeDatePicker({className, ...props}: RangeDatePickerProps) {
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const state = useRangeDatePickerState(props);

    const {groupProps, fieldProps, calendarButtonProps, popupProps, calendarProps, timeInputProps} =
        useDatePickerProps(state, props);

    const isMobile = useMobile();
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
                                <RangeCalendar {...calendarProps} value={state.value} />
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
                className={b('field', {mobile: isMobile})}
                hasClear={!isMobile && fieldProps.hasClear}
                endContent={
                    <React.Fragment>
                        {!isMobile && !isOnlyTime && (
                            <Button {...calendarButtonProps}>
                                <Icon data={CalendarIcon} />
                            </Button>
                        )}
                        {!isMobile && isOnlyTime && (
                            <StubButton size={calendarButtonProps.size} icon={ClockIcon} />
                        )}
                        {isMobile && (
                            <StubButton
                                size={calendarButtonProps.size}
                                icon={isOnlyTime ? ClockIcon : CalendarIcon}
                            />
                        )}
                    </React.Fragment>
                }
            />
        </div>
    );
}
