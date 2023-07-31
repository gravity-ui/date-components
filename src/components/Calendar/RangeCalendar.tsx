import React from 'react';

import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';

import {CalendarBase} from './CalendarBase';
import type {CalendarInstance, CalendarSize} from './CalendarBase';
import {useRangeCalendarState} from './hooks/useRangeCalendarState';
import type {RangeCalendarStateOptions} from './hooks/useRangeCalendarState';

import './Calendar.scss';

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
        return <CalendarBase ref={ref} {...props} state={state} onBlur={handleBlur} />;
    },
);
