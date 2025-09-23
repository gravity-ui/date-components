import React from 'react';

import {useFocusWithin, useLang} from '@gravity-ui/uikit';
import type {ButtonButtonProps} from '@gravity-ui/uikit';

import type {CalendarProps} from '../../Calendar/Calendar';
import {formatDateTime} from '../../utils/dates';
import {i18n} from '../i18n';

import type {CalendarLayout, CalendarState, RangeCalendarState} from './types';

const buttonDisabledClassName = 'yc-button_disabled g-button_disabled';

export function useCalendarProps(props: CalendarProps, state: CalendarState | RangeCalendarState) {
    const {lang} = useLang();
    const title =
        state.mode === 'years' || state.mode === 'quarters'
            ? `${state.startDate.year()} — ${state.endDate.year()}`
            : formatDateTime(
                  state.focusedDate,
                  state.mode === 'days' ? 'MMMM YYYY' : 'YYYY',
                  state.timeZone,
                  lang,
              );

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

    const modeButtonProps: ButtonButtonProps = {
        // Always set a tabIndex so that Safari allows focusing native buttons
        tabIndex: 0,
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
        'aria-disabled': modeDisabled ? 'true' : undefined,
        'aria-description': useAriaDescriptionForModeButton(state.mode, state.availableModes),
        'aria-live': 'polite',
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

    const {t} = i18n.useTranslation();

    const previousButtonProps: ButtonButtonProps = {
        // Always set a tabIndex so that Safari allows focusing native buttons
        tabIndex: 0,
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
        'aria-label': t('Previous'),
        'aria-disabled': previousDisabled ? 'true' : undefined,
    };

    const nextFocused = React.useRef(false);
    const nextDisabled = state.disabled || state.isNextPageInvalid();

    React.useLayoutEffect(() => {
        if (nextDisabled && nextFocused.current) {
            nextFocused.current = false;
            state.setFocused(true);
        }
    });

    const nextButtonProps: ButtonButtonProps = {
        // Always set a tabIndex so that Safari allows focusing native buttons
        tabIndex: 0,
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
        'aria-label': t('Next'),
        'aria-disabled': previousDisabled ? 'true' : undefined,
    };

    return {
        calendarProps,
        modeButtonProps,
        nextButtonProps,
        previousButtonProps,
    };
}

function useAriaDescriptionForModeButton(mode: CalendarLayout, availableModes: CalendarLayout[]) {
    const {t} = i18n.useTranslation();

    const nextModeIndex = availableModes.indexOf(mode) + 1;
    const isModeLast = nextModeIndex === availableModes.length;
    if (isModeLast) {
        return undefined;
    }

    const ariaLabelMap: Record<CalendarLayout, string> = {
        days: '',
        months: t('Switch to months view'),
        quarters: t('Switch to quarters view'),
        years: t('Switch to years view'),
    };
    const nextMode = availableModes[nextModeIndex];
    return ariaLabelMap[nextMode];
}
