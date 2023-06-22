import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {createPlaceholderValue, mergeDateTime} from '../DateField/utils';

import type {DatePickerProps} from './DatePicker';
import type {DatePickerState} from './hooks/useDatePickerState';
import {b, getButtonSize} from './utils';

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
            className={b('calendar-input')}
            disabled={props.disabled}
            type={type}
            value={formatNative(state.dateValue, type)}
            id={props.id}
            min={formatNative(props.minValue, type)}
            max={formatNative(props.maxValue, type)}
            tabIndex={-1}
            onChange={(e) => {
                if (props.readOnly) {
                    return;
                }
                const newValue = e.target.value;
                if (newValue) {
                    const localDate = dateTime({input: newValue, format: getDateFormat(type)});
                    let newDate = state.hasDate
                        ? dateTime({
                              input: newValue,
                              format: getDateFormat(type),
                              timeZone: props.timeZone,
                          })
                        : createPlaceholderValue({
                              placeholderValue: props.placeholderValue,
                              timeZone: props.timeZone,
                          });
                    if (state.hasTime) {
                        newDate = mergeDateTime(newDate, localDate);
                    } else if (state.dateValue) {
                        newDate = mergeDateTime(newDate, state.dateValue);
                    } else {
                        newDate = newDate.set('hours', 0).set('minutes', 0).set('seconds', 0);
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
        <span className={b('calendar', {size: getButtonSize(props.size)})}>
            <span className={b('calendar-button')}>
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
