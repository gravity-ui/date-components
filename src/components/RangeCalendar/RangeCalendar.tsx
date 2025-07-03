'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {Provider, useContextProps} from '../../utils/providers';
import type {CalendarProps} from '../Calendar/Calendar';
import {CalendarContext, CalendarStateContext, CalendarView} from '../CalendarView/CalendarView';
import {useRangeCalendarState} from '../CalendarView/hooks/useRangeCalendarState';
import type {RangeCalendarState} from '../CalendarView/hooks/useRangeCalendarState';
import type {RangeValue} from '../types';

import '../CalendarView/Calendar.scss';

export interface RangeCalendarRenderProps {
    /**
     * State of the calendar.
     */
    state: RangeCalendarState;
}

export type RangeCalendarProps = CalendarProps<RangeValue<DateTime>, RangeCalendarRenderProps>;

export const RangeCalendar = React.forwardRef<HTMLDivElement, RangeCalendarProps>(
    function Calendar(props, forwardedRef) {
        const [mergedProps, ref] = useContextProps(props, forwardedRef, CalendarContext);
        const state = useRangeCalendarState(props);

        const handleBlur = (e: React.FocusEvent) => {
            if (state.anchorDate) {
                state.selectFocusedDate();
            }
            props.onBlur?.(e);
        };
        return (
            <Provider
                values={[
                    [CalendarStateContext, state],
                    [CalendarContext, props],
                ]}
            >
                <CalendarView ref={ref} {...mergedProps} onBlur={handleBlur} />
            </Provider>
        );
    },
);
