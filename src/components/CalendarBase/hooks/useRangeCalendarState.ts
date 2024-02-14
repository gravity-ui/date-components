import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {RangeValue, ValueBase} from '../../types';
import {mergeDateTime} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
import {constrainValue} from '../utils';

import type {CalendarLayout, CalendarStateOptionsBase, RangeCalendarState} from './types';
import {useCalendarState} from './useCalendarState';

export interface RangeCalendarStateOptions
    extends ValueBase<RangeValue<DateTime> | null, RangeValue<DateTime>>,
        CalendarStateOptionsBase {}

export type {RangeCalendarState} from './types';

export function useRangeCalendarState(props: RangeCalendarStateOptions): RangeCalendarState {
    const {value: valueProp, defaultValue = null, onUpdate, ...calendarProps} = props;
    const [value, setValue] = useControlledState(valueProp, defaultValue, onUpdate);

    const [anchorDate, setAnchorDateState] = React.useState<DateTime>();

    const inputTimeZone = useDefaultTimeZone(
        valueProp?.start || defaultValue?.start || props.focusedValue || props.defaultFocusedValue,
    );
    const timeZone = props.timeZone || inputTimeZone;

    const calendar = useCalendarState({...calendarProps, value: null, timeZone});
    const highlightedRange = anchorDate
        ? makeRange(anchorDate, calendar.focusedDate, calendar.mode)
        : (value &&
              makeRange(
                  value.start.timeZone(timeZone),
                  value.end.timeZone(timeZone),
                  calendar.mode,
              )) ??
          undefined;

    const minMode = calendar.availableModes[0];

    const handleSetValue = (v: RangeValue<DateTime>) => {
        if (value) {
            v.start = mergeDateTime(v.start, value.start.timeZone(timeZone));
            v.end = mergeDateTime(v.end, value.end.timeZone(timeZone));
        }
        setValue({start: v.start.timeZone(inputTimeZone), end: v.end.timeZone(inputTimeZone)});
    };

    const selectDate = (date: DateTime, force = false) => {
        if (props.disabled) {
            return;
        }

        if (!force && calendar.mode !== minMode) {
            calendar.zoomIn();
            return;
        }

        if (props.readOnly) {
            return;
        }

        date = constrainValue(date, calendar.minValue, calendar.maxValue);
        if (calendar.isCellUnavailable(date)) {
            return;
        }

        if (anchorDate) {
            const range = makeRange(anchorDate, date, calendar.mode);
            handleSetValue(range);
            setAnchorDateState(undefined);
        } else {
            setAnchorDateState(date);
        }
    };

    return {
        ...calendar,
        value,
        setValue: handleSetValue,
        selectDate,
        anchorDate,
        setAnchorDate: setAnchorDateState,
        highlightedRange,
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

function makeRange(start: DateTime, end: DateTime, mode: CalendarLayout): RangeValue<DateTime> {
    if (start.isBefore(end)) {
        return {
            start,
            end: end.endOf(mode),
        };
    }

    return {
        start: end,
        end: start.endOf(mode),
    };
}
