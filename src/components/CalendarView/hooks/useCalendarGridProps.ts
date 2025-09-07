import {useFocusWithin, useLang} from '@gravity-ui/uikit';

import {formatDateTime} from '../../utils/dates';

import type {CalendarState, RangeCalendarState} from './types';

export function useCalendarGridProps(state: CalendarState | RangeCalendarState) {
    const {focusWithinProps} = useFocusWithin({
        onFocusWithinChange: (isFocused) => {
            state.setFocused(isFocused);
        },
    });

    const {lang} = useLang();
    const gridProps: React.HTMLAttributes<HTMLElement> = {
        role: 'grid',
        'aria-label':
            state.mode === 'years' || state.mode === 'quarters'
                ? `${state.startDate.year()} — ${state.endDate.year()}`
                : formatDateTime(
                      state.focusedDate,
                      state.mode === 'days' ? 'MMMM YYYY' : 'YYYY',
                      state.timeZone,
                      lang,
                  ),
        'aria-disabled': state.disabled ? 'true' : undefined,
        'aria-readonly': state.readOnly ? 'true' : undefined,
        ...focusWithinProps,
        onKeyDown: (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                state.focusNextCell();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                state.focusPreviousCell();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                state.focusNextRow();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                state.focusPreviousRow();
            } else if (e.key === 'PageDown') {
                e.preventDefault();
                state.focusNextPage(e.shiftKey);
            } else if (e.key === 'PageUp') {
                e.preventDefault();
                state.focusPreviousPage(e.shiftKey);
            } else if (e.key === 'End') {
                e.preventDefault();
                state.focusSectionEnd();
            } else if (e.key === 'Home') {
                e.preventDefault();
                state.focusSectionStart();
            } else if (e.code === 'Minus') {
                e.preventDefault();
                state.zoomOut();
            } else if (e.code === 'Equal') {
                e.preventDefault();
                state.zoomIn();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                state.selectDate(state.focusedDate);
            }
        },
    };

    return {
        gridProps,
    };
}
