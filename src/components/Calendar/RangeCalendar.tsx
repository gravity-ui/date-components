import React from 'react';

import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types/index.js';

import {CalendarBase} from './CalendarBase.js';
import type {CalendarInstance, CalendarSize} from './CalendarBase.js';
import {useRangeCalendarState} from './hooks/useRangeCalendarState.js';
import type {RangeCalendarStateOptions} from './hooks/useRangeCalendarState.js';

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
