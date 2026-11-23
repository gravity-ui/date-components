import React from 'react';

import {useFocusWithin, useLang} from '@gravity-ui/uikit';

import {formatDateTime} from '../../utils/dates';

import type {CalendarState, RangeCalendarState} from './types';

const dragThreshold = 8;
const swipeThreshold = 40;
const dragOffsetProperty = '--_--calendar-drag-offset';

export function useCalendarGridProps(state: CalendarState | RangeCalendarState) {
    const {focusWithinProps} = useFocusWithin({
        onFocusWithinChange: (isFocused) => {
            state.setFocused(isFocused);
        },
    });

    const {lang} = useLang();
    const swipeStart = React.useRef<{
        pointerId: number;
        x: number;
        y: number;
        isRtl: boolean;
        maxOffset: number;
    } | null>(null);
    const suppressClick = React.useRef(false);
    const [swipeRelease, setSwipeRelease] = React.useState<{
        offset: string;
        startDate: CalendarState['startDate'];
        mode: CalendarState['mode'];
    } | null>(null);

    const swipeChangedPeriod =
        swipeRelease &&
        swipeRelease.mode === state.mode &&
        !state.startDate.isSame(swipeRelease.startDate, 'days');

    React.useLayoutEffect(() => {
        if (swipeRelease && !swipeChangedPeriod) {
            setSwipeRelease(null);
        }
    }, [swipeRelease, swipeChangedPeriod]);

    function getSwipeDirection(dx: number, isRtl: boolean) {
        return (isRtl ? dx > 0 : dx < 0) ? 'next' : 'previous';
    }

    function canPage(direction: 'next' | 'previous') {
        return (
            !state.disabled &&
            !(direction === 'next' ? state.isNextPageInvalid() : state.isPreviousPageInvalid())
        );
    }

    function getDragOffset(dx: number, start: NonNullable<typeof swipeStart.current>) {
        const allowed = canPage(getSwipeDirection(dx, start.isRtl));
        return Math.sign(dx) * Math.min(Math.abs(dx) * (allowed ? 1 : 0.2), start.maxOffset);
    }

    function endDrag(grid: HTMLDivElement) {
        swipeStart.current = null;
        grid.style.removeProperty(dragOffsetProperty);
        grid.removeAttribute('data-dragging');
    }

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
            endDrag(event.currentTarget);
            swipeStart.current =
                !state.disabled && event.pointerType === 'touch' && event.isPrimary
                    ? {
                          pointerId: event.pointerId,
                          x: event.clientX,
                          y: event.clientY,
                          isRtl: getComputedStyle(event.currentTarget).direction === 'rtl',
                          maxOffset: event.currentTarget.clientWidth / 3,
                      }
                    : null;
        },
        onPointerMove: (event) => {
            const start = swipeStart.current;
            if (!start || start.pointerId !== event.pointerId) {
                return;
            }

            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (!suppressClick.current) {
                if (Math.abs(dy) >= dragThreshold && Math.abs(dy) >= Math.abs(dx)) {
                    endDrag(event.currentTarget);
                    return;
                }
                if (Math.abs(dx) < dragThreshold) {
                    return;
                }
            }

            suppressClick.current = true;
            event.currentTarget.setAttribute('data-dragging', '');
            event.currentTarget.style.setProperty(
                dragOffsetProperty,
                `${getDragOffset(dx, start)}px`,
            );
        },
        onPointerCancel: (event) => {
            if (swipeStart.current?.pointerId === event.pointerId) {
                endDrag(event.currentTarget);
            }
        },
        onPointerUp: (event) => {
            const start = swipeStart.current;
            if (!start || start.pointerId !== event.pointerId) {
                return;
            }

            const preview = event.currentTarget.style.getPropertyValue(dragOffsetProperty);
            endDrag(event.currentTarget);
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) < swipeThreshold || Math.abs(dx) <= Math.abs(dy)) {
                return;
            }

            // A touch swipe can still synthesize a click on the starting cell.
            suppressClick.current = true;
            const direction = getSwipeDirection(dx, start.isRtl);
            if (!canPage(direction)) {
                return;
            }

            if (preview) {
                setSwipeRelease({
                    offset: preview,
                    startDate: state.startDate,
                    mode: state.mode,
                });
            }
            if (direction === 'next') {
                state.focusNextPage();
            } else {
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
        slideOffset: swipeChangedPeriod ? swipeRelease.offset : '0px',
        clearSlideOffset: () => setSwipeRelease(null),
    };
}
