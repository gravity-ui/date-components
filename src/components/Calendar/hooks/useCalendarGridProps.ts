import React from 'react';

import {useFocusWithin} from '@gravity-ui/uikit';

import type {CalendarState, RangeCalendarState} from './types';

export function useCalendarGridProps(state: CalendarState | RangeCalendarState) {
    const {focusWithinProps} = useFocusWithin({
        onFocusWithinChange: (isFocused) => {
            state.setFocused(isFocused);
        },
    });

    const gridProps: React.HTMLAttributes<HTMLElement> = {
        role: 'grid',
        'aria-label':
            state.mode === 'years'
                ? `${state.startDate.year()} — ${state.endDate.year()}`
                : state.focusedDate.format(state.mode === 'days' ? 'MMMM YYYY' : 'YYYY'),
        'aria-disabled': state.disabled ? 'true' : undefined,
        'aria-readonly': state.readOnly ? 'true' : undefined,
        ...focusWithinProps,
        onKeyDown: (e) => {
            if (e.key === 'ArrowRight') {
                state.focusNextCell();
            } else if (e.key === 'ArrowLeft') {
                state.focusPreviousCell();
            } else if (e.key === 'ArrowDown') {
                state.focusNextRow();
            } else if (e.key === 'ArrowUp') {
                state.focusPreviousRow();
            } else if (e.key === 'PageDown') {
                state.focusNextPage(e.shiftKey);
            } else if (e.key === 'PageUp') {
                state.focusPreviousPage(e.shiftKey);
            } else if (e.key === 'End') {
                state.focusSectionEnd();
            } else if (e.key === 'Home') {
                state.focusSectionStart();
            } else if (e.code === 'Minus') {
                state.zoomOut();
            } else if (e.code === 'Equal') {
                state.zoomIn();
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (state.mode === 'days') {
                    state.selectFocusedDate();
                } else {
                    state.setMode(state.mode === 'months' ? 'days' : 'months');
                }
            }
        },
    };

    return {
        gridProps,
    };
}
