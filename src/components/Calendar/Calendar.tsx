import React from 'react';

import {CalendarBase} from '../CalendarBase/CalendarBase';
import type {CalendarInstance, CalendarSize} from '../CalendarBase/CalendarBase';
import {useCalendarState} from '../CalendarBase/hooks/useCalendarState';
import type {CalendarStateOptions} from '../CalendarBase/hooks/useCalendarState';
import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';

import './Calendar.scss';

export interface CalendarProps
    extends CalendarStateOptions,
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
export const Calendar = React.forwardRef<CalendarInstance, CalendarProps>(function Calendar(
    props: CalendarProps,
    ref,
) {
    const state = useCalendarState(props);

    return <CalendarBase ref={ref} {...props} state={state} />;
});
