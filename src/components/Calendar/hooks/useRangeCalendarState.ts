import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {useControlledState} from '../../hooks/useControlledState';
import type {RangeValue, ValueBase} from '../../types';
import {constrainValue} from '../utils';

import type {CalendarStateOptionsBase, RangeCalendarState} from './types';
import {useCalendarState} from './useCalendarState';

export interface RangeCalendarStateOptions
    extends ValueBase<RangeValue<DateTime>>,
        CalendarStateOptionsBase {}

export type {RangeCalendarState} from './types';

export function useRangeCalendarState(props: RangeCalendarStateOptions): RangeCalendarState {
    const {value: valueProp, defaultValue, onUpdate, ...calendarProps} = props;
    const [value, setValue] = useControlledState(valueProp, defaultValue, onUpdate);

    const [anchorDate, setAnchorDateState] = React.useState<DateTime>();

    const calendar = useCalendarState({...calendarProps, value: value?.start ?? null});
    const highlightedRange = anchorDate
        ? makeRange(anchorDate, calendar.focusedDate)
        : (value && makeRange(value.start, value.end)) ?? undefined;

    const selectDate = (date: DateTime) => {
        if (props.disabled || props.readOnly) {
            return;
        }

        date = constrainValue(date, props.minValue, props.maxValue);
        if (calendar.isCellUnavailable(date)) {
            return;
        }

        if (anchorDate) {
            const range = makeRange(anchorDate, date);
            setValue(range);
            setAnchorDateState(undefined);
        } else {
            setAnchorDateState(date);
        }
    };

    return {
        ...calendar,
        value,
        setValue,
        selectDate,
        anchorDate,
        setAnchorDate: setAnchorDateState,
        highlightedRange,
        selectFocusedDate() {
            selectDate(calendar.focusedDate);
        },
        isSelected(date) {
            if (!highlightedRange) {
                return false;
            }

            return (
                (date.isSame(highlightedRange.start, this.mode) ||
                    date.isAfter(highlightedRange.start)) &&
                (date.isSame(highlightedRange.end, this.mode) ||
                    date.isBefore(highlightedRange.end))
            );
        },
        highlightDate(date) {
            if (anchorDate) {
                this.setFocusedDate(date);
            }
        },
    };
}

function makeRange(start: DateTime, end: DateTime): RangeValue<DateTime> {
    if (start.isBefore(end)) {
        return {
            start,
            end,
        };
    }

    return {
        start: end,
        end: start,
    };
}
