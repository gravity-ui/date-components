import React from 'react';

import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types/index.js';

import {CalendarBase} from './CalendarBase.js';
import type {CalendarInstance, CalendarSize} from './CalendarBase.js';
import {useCalendarState} from './hooks/useCalendarState.js';
import type {CalendarStateOptions} from './hooks/useCalendarState.js';

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
