'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {CalendarView} from '../CalendarView/CalendarView';
import type {CalendarInstance, CalendarSize} from '../CalendarView/CalendarView';
import type {CalendarValueType, SelectionMode} from '../CalendarView/hooks/types';
import {useCalendarState} from '../CalendarView/hooks/useCalendarState';
import type {CalendarStateOptions} from '../CalendarView/hooks/useCalendarState';
import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';

import '../CalendarView/Calendar.scss';

export interface CalendarCommonProps<T = DateTime>
    extends CalendarStateOptions<T>, DomProps, StyleProps, FocusEvents, AccessibilityProps {
    /**
     * The size of the element.
     * @default m
     */
    size?: CalendarSize;
}

export interface CalendarProps<M extends SelectionMode = 'single'> extends CalendarCommonProps<
    CalendarValueType<M>
> {
    selectionMode?: M;
}

export const Calendar = React.forwardRef<CalendarInstance, CalendarProps>(function Calendar(
    props: CalendarProps,
    ref,
) {
    const state = useCalendarState(props);

    return <CalendarView ref={ref} {...props} state={state} />;
}) as <M extends SelectionMode = 'single'>(
    props: CalendarProps<M> & React.RefAttributes<CalendarInstance>,
) => React.ReactNode;
