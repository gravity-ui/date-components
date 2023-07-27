import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {CalendarState} from './useCalendarState';

export function useCalendarCellProps(date: DateTime, state: CalendarState) {
    const ref = React.useRef<HTMLDivElement>(null);

    const isFocused = state.isCellFocused(date);
    React.useEffect(() => {
        if (isFocused) {
            ref.current?.focus({preventScroll: true});
        }
    }, [isFocused]);

    const tabIndex = state.focusedDate.isSame(date, state.mode) ? 0 : -1;
    const isDisabled = state.isCellDisabled(date);
    const isSelected = state.isSelected(date);
    const isOutsideCurrentRange =
        state.mode === 'days' ? !state.focusedDate.isSame(date, 'month') : false;
    const isUnavailable = state.isCellUnavailable(date);
    const isSelectable = !isDisabled && !isUnavailable;
    const isCurrent = dateTime().isSame(date, state.mode);
    const isWeekend = state.isWeekend(date);

    let label = '';
    if (state.mode === 'days') {
        label = `${date.format('dddd')}, ${date.format('LL')}`;
    } else if (state.mode === 'months') {
        label = `${date.format('MMMM YYYY')}`;
    } else if (state.mode === 'years') {
        label = `${date.format('YYYY')}`;
    }

    const cellProps: React.HTMLAttributes<unknown> = {
        role: 'gridcell',
        'aria-selected': isSelected ? 'true' : undefined,
        'aria-disabled': isDisabled ? 'true' : undefined,
    };

    const buttonProps: React.HTMLAttributes<unknown> & {ref: React.Ref<HTMLDivElement>} = {
        ref,
        role: 'button',
        tabIndex: isDisabled ? undefined : tabIndex,
        'aria-disabled': isSelectable ? undefined : 'true',
        'aria-label': label,
        onClick: isSelectable
            ? () => {
                  state.setFocusedDate(date);
                  if (state.mode === 'days') {
                      state.setValue(date);
                  } else {
                      state.zoomIn();
                  }
              }
            : undefined,
    };

    let formattedDate = date.format('D');
    if (state.mode === 'months') {
        formattedDate = date.format('MMM');
    } else if (state.mode === 'years') {
        formattedDate = date.format('YYYY');
    }

    return {
        cellProps,
        buttonProps,
        formattedDate,
        isDisabled,
        isSelected,
        isOutsideCurrentRange,
        isUnavailable,
        isCurrent,
        isWeekend,
    };
}
