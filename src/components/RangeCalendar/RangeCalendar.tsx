'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import type {CalendarCommonProps} from '../Calendar/Calendar';
import {CalendarView} from '../CalendarView/CalendarView';
import type {CalendarInstance} from '../CalendarView/CalendarView';
import {useRangeCalendarState} from '../CalendarView/hooks/useRangeCalendarState';
import type {RangeCalendarStateOptions} from '../CalendarView/hooks/useRangeCalendarState';
import type {RangeValue} from '../types';

import '../CalendarView/Calendar.scss';

export type RangeCalendarProps = CalendarCommonProps<RangeValue<DateTime>> &
    RangeCalendarStateOptions;

export const RangeCalendar = React.forwardRef<CalendarInstance, RangeCalendarProps>(
    function Calendar(props: RangeCalendarProps, ref) {
        const state = useRangeCalendarState(props);

        const handleBlur = (e: React.FocusEvent) => {
            // A controlled anchor belongs to the parent, only an uncontrolled selection is completed here.
            if (props.anchorDate === undefined && state.anchorDate) {
                state.selectFocusedDate();
            }
            props.onBlur?.(e);
        };
        return <CalendarView ref={ref} {...props} state={state} onBlur={handleBlur} />;
    },
);
