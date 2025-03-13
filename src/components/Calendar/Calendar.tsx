'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {Provider, useContextProps} from '../../utils/providers';
import type {RenderProps, SlotProps} from '../../utils/providers';
import {CalendarContext, CalendarStateContext, CalendarView} from '../CalendarView/CalendarView';
import type {CalendarSize} from '../CalendarView/CalendarView';
import {useCalendarState} from '../CalendarView/hooks/useCalendarState';
import type {CalendarState, CalendarStateOptions} from '../CalendarView/hooks/useCalendarState';
import type {AccessibilityProps, DomProps, FocusEvents} from '../types';

import '../CalendarView/Calendar.scss';

export interface CalendarRenderProps {
    /**
     * State of the calendar.
     */
    state: CalendarState;
}

export interface CalendarProps<T = DateTime, RP = CalendarRenderProps>
    extends CalendarStateOptions<T>,
        RenderProps<RP>,
        DomProps,
        FocusEvents,
        AccessibilityProps,
        SlotProps {
    /**
     * The size of the element.
     * @default m
     */
    size?: CalendarSize;
}
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
    props: CalendarProps,
    forwardedRef,
) {
    const [mergedProps, ref] = useContextProps(props, forwardedRef, CalendarContext);
    const state = useCalendarState(mergedProps as any);

    return (
        <Provider
            values={[
                [CalendarStateContext, state],
                [CalendarContext, mergedProps],
            ]}
        >
            <CalendarView ref={ref} {...mergedProps} />
        </Provider>
    );
});
