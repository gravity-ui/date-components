import React from 'react';

import {useFocusWithin, useLang} from '@gravity-ui/uikit';

import {formatDateTime} from '../../utils/dates';

import type {CalendarState, RangeCalendarState} from './types';

const swipeThreshold = 40;

export function useCalendarGridProps(state: CalendarState | RangeCalendarState) {
    const {focusWithinProps} = useFocusWithin({
        onFocusWithinChange: (isFocused) => {
            state.setFocused(isFocused);
        },
    });

    const {lang} = useLang();
    const swipeStart = React.useRef<{pointerId: number; x: number; y: number} | null>(null);
    const suppressClick = React.useRef(false);

    const gridProps: React.HTMLAttributes<HTMLDivElement> = {
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
        onPointerDown: (event) => {
            suppressClick.current = false;
            swipeStart.current =
                !state.disabled && event.pointerType === 'touch' && event.isPrimary
                    ? {pointerId: event.pointerId, x: event.clientX, y: event.clientY}
                    : null;
        },
        onPointerCancel: () => {
            swipeStart.current = null;
        },
        onPointerUp: (event) => {
            const start = swipeStart.current;
            if (!start || start.pointerId !== event.pointerId) {
                return;
            }

            swipeStart.current = null;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) < swipeThreshold || Math.abs(dx) <= Math.abs(dy)) {
                return;
            }

            // A touch swipe can still synthesize a click on the starting cell.
            suppressClick.current = true;
            if (state.disabled) {
                return;
            }

            const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl';
            const isNext = isRtl ? dx > 0 : dx < 0;
            if (isNext && !state.isNextPageInvalid()) {
                state.focusNextPage();
            } else if (!isNext && !state.isPreviousPageInvalid()) {
                state.focusPreviousPage();
            }
        },
        onClickCapture: (event) => {
            if (event.detail > 0 && suppressClick.current) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
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
