import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';

import {i18n} from '../i18n';

import type {CalendarState} from './useCalendarState';

export interface CalendarPropsOptions {
    id?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
}

export function useCalendarProps(props: CalendarPropsOptions, state: CalendarState) {
    const title =
        state.mode === 'years'
            ? `${state.startDate.year()} — ${state.endDate.year()}`
            : state.focusedDate.format(state.mode === 'days' ? 'MMMM YYYY' : 'YYYY');

    const calendarProps: React.HTMLAttributes<HTMLElement> = {
        role: 'group',
        id: props.id,
        'aria-label': [props['aria-label'], title].filter(Boolean).join(', '),
        'aria-describedby': props['aria-describedby'] || undefined,
    };

    const modeDisabled = state.disabled || state.mode === 'years';

    const modeButtonProps: ButtonProps = {
        disabled: modeDisabled,
        onClick: () => {
            state.zoomOut();
            if (state.mode === 'months') {
                state.setFocused(true);
            }
        },
        children: title,
    };

    const previousFocused = React.useRef(false);
    const previousDisabled = state.disabled || state.isInvalid(state.startDate.add({days: -1}));

    React.useLayoutEffect(() => {
        if (previousDisabled && previousFocused.current) {
            previousFocused.current = false;
            state.setFocused(true);
        }
    });

    const previousButtonProps: ButtonProps = {
        disabled: previousDisabled,
        onClick: () => {
            state.focusPreviousPage();
        },
        onFocus: () => {
            previousFocused.current = true;
        },
        onBlur: () => {
            previousFocused.current = false;
        },
        extraProps: {
            'aria-label': i18n('Previous'),
        },
    };

    const nextFocused = React.useRef(false);
    const nextDisabled = state.disabled || state.isInvalid(state.endDate.add({days: 1}));

    React.useLayoutEffect(() => {
        if (nextDisabled && nextFocused.current) {
            nextFocused.current = false;
            state.setFocused(true);
        }
    });

    const nextButtonProps: ButtonProps = {
        disabled: nextDisabled,
        onClick: () => {
            state.focusNextPage();
        },
        onFocus: () => {
            nextFocused.current = true;
        },
        onBlur: () => {
            nextFocused.current = false;
        },
        extraProps: {
            'aria-label': i18n('Next'),
        },
    };

    return {
        calendarProps,
        modeButtonProps,
        nextButtonProps,
        previousButtonProps,
    };
}
