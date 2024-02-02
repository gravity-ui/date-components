import React from 'react';

import {useFocusWithin} from '@gravity-ui/uikit';
import type {ButtonProps} from '@gravity-ui/uikit';

import type {CalendarProps} from '../../Calendar/Calendar';
import {i18n} from '../i18n';

import type {CalendarState, RangeCalendarState} from './types';

const buttonDisabledClassName = 'yc-button_disabled g-button_disabled';

// eslint-disable-next-line complexity
export function useCalendarProps(props: CalendarProps, state: CalendarState | RangeCalendarState) {
    const title =
        state.mode === 'years' || state.mode === 'quarters'
            ? `${state.startDate.year()} — ${state.endDate.year()}`
            : state.focusedDate.format(state.mode === 'days' ? 'MMMM YYYY' : 'YYYY');

    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: props.onFocus,
        onBlurWithin: props.onBlur,
    });

    const calendarProps: React.HTMLAttributes<HTMLElement> = {
        role: 'group',
        id: props.id,
        'aria-label': [props['aria-label'], title].filter(Boolean).join(', '),
        'aria-labelledby': props['aria-labelledby'] || undefined,
        'aria-describedby': props['aria-describedby'] || undefined,
        'aria-details': props['aria-details'] || undefined,
        'aria-disabled': state.disabled || undefined,
        ...focusWithinProps,
    };

    const modeIndex = state.availableModes.indexOf(state.mode);
    const isModeLast = modeIndex + 1 === state.availableModes.length;
    const isNextModeLast = modeIndex + 2 === state.availableModes.length;
    const modeDisabled = state.disabled || isModeLast;

    const modeButtonProps: ButtonProps = {
        disabled: state.disabled,
        // FIXME: do not use button class name
        className: modeDisabled ? buttonDisabledClassName : undefined,
        onClick: modeDisabled
            ? undefined
            : () => {
                  state.zoomOut();
                  if (isNextModeLast) {
                      state.setFocused(true);
                  }
              },
        extraProps: {
            'aria-disabled': modeDisabled ? 'true' : undefined,
        },
        children: title,
    };

    const previousFocused = React.useRef(false);
    const previousDisabled = state.disabled || state.isPreviousPageInvalid();

    React.useLayoutEffect(() => {
        if (previousDisabled && previousFocused.current) {
            previousFocused.current = false;
            state.setFocused(true);
        }
    });

    const previousButtonProps: ButtonProps = {
        disabled: state.disabled,
        // FIXME: do not use button class name
        className: previousDisabled ? buttonDisabledClassName : undefined,
        onClick: previousDisabled
            ? undefined
            : () => {
                  state.focusPreviousPage();
              },
        onFocus: previousDisabled
            ? undefined
            : () => {
                  previousFocused.current = true;
              },
        onBlur: previousDisabled
            ? undefined
            : () => {
                  previousFocused.current = false;
              },
        extraProps: {
            'aria-label': i18n('Previous'),
            'aria-disabled': previousDisabled ? 'true' : undefined,
        },
    };

    const nextFocused = React.useRef(false);
    const nextDisabled = state.disabled || state.isNextPageInvalid();

    React.useLayoutEffect(() => {
        if (nextDisabled && nextFocused.current) {
            nextFocused.current = false;
            state.setFocused(true);
        }
    });

    const nextButtonProps: ButtonProps = {
        disabled: state.disabled,
        // FIXME: do not use button class name
        className: nextDisabled ? buttonDisabledClassName : undefined,
        onClick: nextDisabled
            ? undefined
            : () => {
                  state.focusNextPage();
              },
        onFocus: nextDisabled
            ? undefined
            : () => {
                  nextFocused.current = true;
              },
        onBlur: nextDisabled
            ? undefined
            : () => {
                  nextFocused.current = false;
              },
        extraProps: {
            'aria-label': i18n('Next'),
            'aria-disabled': previousDisabled ? 'true' : undefined,
        },
    };

    return {
        calendarProps,
        modeButtonProps,
        nextButtonProps,
        previousButtonProps,
    };
}
