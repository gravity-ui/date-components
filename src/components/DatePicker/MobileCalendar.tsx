'use client';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {block} from '../../utils/cn';
import type {FormatInfo} from '../DateField/types';
import {createPlaceholderValue, mergeDateTime} from '../utils/dates';

import type {DatePickerProps} from './DatePicker';
import type {DatePickerState} from './hooks/useDatePickerState';

import './MobileCalendar.scss';

const b = block('mobile-calendar');

type InputDateType = 'date' | 'time' | 'datetime-local';

interface MobileCalendarProps {
    props: DatePickerProps;
    state: DatePickerState;
}
export function MobileCalendar({props, state}: MobileCalendarProps) {
    let type: InputDateType = 'date';
    if (state.formatInfo.hasTime && state.formatInfo.hasDate) {
        type = 'datetime-local';
    } else if (state.formatInfo.hasTime) {
        type = 'time';
    }

    const precision = state.formatInfo.minTimeUnit;
    let step;
    if (state.formatInfo.hasTime && precision === 'millisecond') {
        step = 0.001;
    } else if (state.formatInfo.hasTime && precision === 'second') {
        step = 1;
    }

    return (
        <input
            className={b()}
            disabled={props.disabled}
            type={type}
            step={step}
            value={formatNative(state.dateFieldState.value, type, precision)}
            id={props.id}
            min={formatNative(props.minValue?.timeZone(state.timeZone), type, precision)}
            max={formatNative(props.maxValue?.timeZone(state.timeZone), type, precision)}
            tabIndex={-1}
            onChange={(e) => {
                if (props.readOnly) {
                    return;
                }
                const newValue = e.target.value;
                if (newValue) {
                    const localDate = dateTime({
                        input: type === 'time' ? `1970-01-01T${newValue}` : newValue,
                        timeZone: 'system',
                    }).timeZone(state.timeZone, true);
                    let newDate = state.formatInfo.hasDate
                        ? localDate
                        : createPlaceholderValue({
                              placeholderValue: props.placeholderValue?.timeZone(state.timeZone),
                              timeZone: state.timeZone,
                          });
                    if (state.formatInfo.hasTime) {
                        newDate = mergeDateTime(newDate, localDate);
                    } else if (state.value) {
                        newDate = mergeDateTime(newDate, state.value.timeZone(state.timeZone));
                    } else {
                        newDate = mergeDateTime(
                            newDate,
                            createPlaceholderValue({
                                placeholderValue: props.placeholderValue?.timeZone(state.timeZone),
                                timeZone: state.timeZone,
                            }),
                        );
                    }
                    state.setValue(newDate);
                } else {
                    state.setValue(null);
                }
            }}
        />
    );
}

function getDateFormat(type: InputDateType, precision: FormatInfo['minTimeUnit']) {
    let timeFormat = 'HH:mm';
    if (precision === 'millisecond') {
        timeFormat = 'HH:mm:ss.SSS';
    } else if (precision === 'second') {
        timeFormat = 'HH:mm:ss';
    }
    switch (type) {
        case 'time': {
            return timeFormat;
        }
        case 'datetime-local': {
            return `YYYY-MM-DD[T]${timeFormat}`;
        }
        default: {
            return 'YYYY-MM-DD';
        }
    }
}
function formatNative(
    date: DateTime | null | undefined,
    type: InputDateType,
    precision: FormatInfo['minTimeUnit'],
) {
    if (!date) {
        return '';
    }

    const format = getDateFormat(type, precision);
    return date.format(format);
}
