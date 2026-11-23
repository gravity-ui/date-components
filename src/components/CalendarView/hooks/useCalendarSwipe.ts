import React from 'react';

import {constrainValue} from '../../utils/dates';
import {getPageDate} from '../utils';

import type {CalendarState, RangeCalendarState} from './types';

const dragThreshold = 8;
const swipeThresholdRatio = 1 / 3;
const dragOffsetProperty = '--_--calendar-drag-offset';
type SwipeDirection = 'next' | 'previous';

export function useCalendarSwipe(state: CalendarState | RangeCalendarState) {
    const swipeStart = React.useRef<{
        pointerId: number;
        x: number;
        y: number;
        isRtl: boolean;
        maxOffset: number;
        previewDirection: SwipeDirection | null;
    } | null>(null);
    const suppressClick = React.useRef(false);
    const [preview, setPreview] = React.useState<{
        direction: SwipeDirection;
        startDate: CalendarState['startDate'];
        mode: CalendarState['mode'];
    } | null>(null);
    const [swipeRelease, setSwipeRelease] = React.useState<{
        offset: string;
        startDate: CalendarState['startDate'];
        mode: CalendarState['mode'];
    } | null>(null);

    const swipeChangedPeriod =
        swipeRelease &&
        swipeRelease.mode === state.mode &&
        !state.startDate.isSame(swipeRelease.startDate, 'days');

    if (swipeRelease && !swipeChangedPeriod) {
        setSwipeRelease(null);
    }

    if (
        preview &&
        (preview.mode !== state.mode || !preview.startDate.isSame(state.startDate, 'days'))
    ) {
        setPreview(null);
    }

    function getSwipeDirection(dx: number, isRtl: boolean): SwipeDirection {
        return (isRtl ? dx > 0 : dx < 0) ? 'next' : 'previous';
    }

    function canPage(direction: SwipeDirection) {
        return (
            !state.disabled &&
            !(direction === 'next' ? state.isNextPageInvalid() : state.isPreviousPageInvalid())
        );
    }

    function endDrag(grid: HTMLDivElement) {
        swipeStart.current = null;
        grid.style.removeProperty(dragOffsetProperty);
        grid.removeAttribute('data-dragging');
    }

    const swipeProps: React.HTMLAttributes<HTMLDivElement> = {
        onPointerDown: (event) => {
            suppressClick.current = false;
            endDrag(event.currentTarget);
            setPreview(null);
            swipeStart.current =
                !state.disabled && event.pointerType === 'touch' && event.isPrimary
                    ? {
                          pointerId: event.pointerId,
                          x: event.clientX,
                          y: event.clientY,
                          isRtl: getComputedStyle(event.currentTarget).direction === 'rtl',
                          maxOffset: event.currentTarget.getBoundingClientRect().width,
                          previewDirection: null,
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
            const direction = getSwipeDirection(dx, start.isRtl);
            const allowed = canPage(direction);
            const previewDirection = allowed ? direction : null;
            if (start.previewDirection !== previewDirection) {
                start.previewDirection = previewDirection;
                setPreview(
                    previewDirection
                        ? {
                              direction: previewDirection,
                              startDate: state.startDate,
                              mode: state.mode,
                          }
                        : null,
                );
            }

            const limit = allowed ? start.maxOffset : start.maxOffset / 3;
            const offset = Math.sign(dx) * Math.min(Math.abs(dx) * (allowed ? 1 : 0.2), limit);
            event.currentTarget.setAttribute('data-dragging', '');
            event.currentTarget.style.setProperty(dragOffsetProperty, `${offset}px`);
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

            const releaseOffset = event.currentTarget.style.getPropertyValue(dragOffsetProperty);
            endDrag(event.currentTarget);
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            const swipeThreshold = start.maxOffset * swipeThresholdRatio;
            if (Math.abs(dx) < swipeThreshold || Math.abs(dx) <= Math.abs(dy)) {
                return;
            }

            // A touch swipe can still synthesize a click on the starting cell.
            suppressClick.current = true;
            const direction = getSwipeDirection(dx, start.isRtl);
            if (!canPage(direction)) {
                return;
            }

            if (releaseOffset) {
                setSwipeRelease({
                    offset: releaseOffset,
                    startDate: state.startDate,
                    mode: state.mode,
                });
            }
            if ('preservePreviewForFocus' in state && state.anchorDate) {
                const pageFocus = getPageDate(state.focusedDate, state.mode, direction).startOf(
                    state.mode,
                );
                state.preservePreviewForFocus(
                    constrainValue(pageFocus, state.minValue, state.maxValue),
                );
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
    };

    return {
        swipeProps,
        previewDirection: preview?.direction,
        clearPreview: () => {
            if (!swipeStart.current) {
                setPreview(null);
            }
        },
        slideOffset: swipeChangedPeriod ? swipeRelease.offset : '0px',
        clearSlideOffset: () => setSwipeRelease(null),
    };
}
