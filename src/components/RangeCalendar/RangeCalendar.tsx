import React from 'react';

import {CalendarView} from '../CalendarView/CalendarView';
import type {CalendarInstance, CalendarSize} from '../CalendarView/CalendarView';
import {useRangeCalendarState} from '../CalendarView/hooks/useRangeCalendarState';
import type {RangeCalendarStateOptions} from '../CalendarView/hooks/useRangeCalendarState';
import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';

import '../CalendarView/Calendar.scss';

export interface RangeCalendarProps
    extends RangeCalendarStateOptions,
        DomProps,
        StyleProps,
        FocusEvents,
        AccessibilityProps {
    /**
     * The size of the element.
     * @default m
     */
    size?: CalendarSize;
}
export const RangeCalendar = React.forwardRef<CalendarInstance, RangeCalendarProps>(
    function Calendar(props: RangeCalendarProps, ref) {
        const state = useRangeCalendarState(props);

        const handleBlur = (e: React.FocusEvent) => {
            if (state.anchorDate) {
                state.selectFocusedDate();
            }
            props.onBlur?.(e);
        };
        return <CalendarView ref={ref} {...props} state={state} onBlur={handleBlur} />;
    },
);
