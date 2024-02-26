import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import type {CalendarLayout, CalendarState, RangeCalendarState} from './types';

export function useCalendarCellProps(date: DateTime, state: CalendarState | RangeCalendarState) {
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
    const highlightedRange = 'highlightedRange' in state && state.highlightedRange;
    const isRangeSelection = Boolean(highlightedRange && isSelected);
    const isSelectionStart =
        isSelected && highlightedRange && date.isSame(highlightedRange.start, state.mode);
    const isSelectionEnd =
        isSelected && highlightedRange && date.isSame(highlightedRange.end, state.mode);
    const isOutsideCurrentRange =
        state.mode === 'days' ? !state.focusedDate.isSame(date, 'month') : false;
    const isUnavailable = state.isCellUnavailable(date);
    const isSelectable = !isDisabled && !isUnavailable;
    const isCurrent = state.isCurrent(date);
    const isWeekend = state.isWeekend(date);

    const label = getDateLabel(date, state.mode);

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
                  state.selectDate(date);
              }
            : undefined,
        onPointerEnter() {
            if ('highlightDate' in state && isSelectable) {
                if (isOutsideCurrentRange) {
                    const newDate = date.isBefore(state.focusedDate)
                        ? state.focusedDate.startOf('month')
                        : state.focusedDate.endOf('month').startOf('date');
                    state.highlightDate(newDate);
                } else {
                    state.highlightDate(date);
                }
            }
        },
    };

    let formattedDate = date.format('D');
    if (state.mode === 'months') {
        formattedDate = date.format('MMM');
    } else if (state.mode === 'quarters') {
        formattedDate = date.format('[Q]Q');
    } else if (state.mode === 'years') {
        formattedDate = date.format('YYYY');
    }

    return {
        cellProps,
        buttonProps,
        formattedDate,
        isDisabled,
        isSelected,
        isRangeSelection,
        isSelectionStart,
        isSelectionEnd,
        isOutsideCurrentRange,
        isUnavailable,
        isCurrent,
        isWeekend,
    };
}

function getDateLabel(date: DateTime, mode: CalendarLayout) {
    let label = '';
    if (mode === 'days') {
        label = `${date.format('dddd')}, ${date.format('LL')}`;
    } else if (mode === 'months') {
        label = `${date.format('MMMM YYYY')}`;
    } else if (mode === 'quarters') {
        label = `${date.format('[Q]Q YYYY')}`;
    } else if (mode === 'years') {
        label = `${date.format('YYYY')}`;
    }
    return label;
}
