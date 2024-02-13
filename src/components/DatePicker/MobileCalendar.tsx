import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {createPlaceholderValue, mergeDateTime} from '../utils/dates';
import {getButtonSizeForInput} from '../utils/getButtonSizeForInput';

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
    if (state.hasTime && state.hasDate) {
        type = 'datetime-local';
    } else if (state.hasTime) {
        type = 'time';
    }

    return (
        <input
            className={b('input')}
            disabled={props.disabled}
            type={type}
            value={formatNative(state.dateFieldState.displayValue, type)}
            id={props.id}
            min={formatNative(props.minValue?.timeZone(state.timeZone), type)}
            max={formatNative(props.maxValue?.timeZone(state.timeZone), type)}
            tabIndex={-1}
            onChange={(e) => {
                if (props.readOnly) {
                    return;
                }
                const newValue = e.target.value;
                if (newValue) {
                    const localDate = dateTime({
                        input: newValue,
                        format: getDateFormat(type),
                        timeZone: 'system',
                    }).timeZone(state.timeZone, true);
                    let newDate = state.hasDate
                        ? localDate
                        : createPlaceholderValue({
                              placeholderValue: props.placeholderValue?.timeZone(state.timeZone),
                              timeZone: state.timeZone,
                          });
                    if (state.hasTime) {
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

interface MobileCalendarIconProps {
    props: DatePickerProps;
    state: DatePickerState;
}
export function MobileCalendarIcon({props}: MobileCalendarIconProps) {
    return (
        <span className={b({size: getButtonSizeForInput(props.size)})}>
            <span className={b('button')}>
                <Icon data={CalendarIcon} />
            </span>
        </span>
    );
}

function getDateFormat(type: InputDateType) {
    switch (type) {
        case 'time': {
            return 'HH:mm';
        }
        case 'datetime-local': {
            return 'YYYY-MM-DDTHH:mm';
        }
        default: {
            return 'YYYY-MM-DD';
        }
    }
}
function formatNative(date: DateTime | null | undefined, type: InputDateType) {
    if (!date) {
        return '';
    }

    const format = getDateFormat(type);
    return date.format(format);
}
