import React from 'react';

import {useFocusWithin} from '@gravity-ui/uikit';
import type {PopupProps, TextInputProps} from '@gravity-ui/uikit';

import type {CalendarProps} from '../../Calendar';
import type {DateFieldProps} from '../../DateField';
import {filterDOMProps} from '../../utils/filterDOMProps.js';
import type {RelativeDateFieldProps} from '../RelativeDateField';

import type {RelativeDateFieldState} from './useRelativeDateFieldState';

interface RelativeDateProps {
    groupProps: React.HTMLAttributes<unknown>;
    inputProps: TextInputProps & {ref: React.Ref<HTMLElement>};
    popupProps: PopupProps;
    calendarProps: CalendarProps;
    timeInputProps: DateFieldProps;
}

export function useRelativeDateFieldProps(
    state: RelativeDateFieldState,
    props: RelativeDateFieldProps,
): RelativeDateProps {
    const lastCorrectDate = state.lastCorrectDate ? state.lastCorrectDate.startOf('day') : null;
    const [prevCorrectDate, setPrevCorrectDate] = React.useState(lastCorrectDate);
    const [focusedDate, setFocusedDate] = React.useState(lastCorrectDate);

    if (lastCorrectDate && (!prevCorrectDate || !lastCorrectDate.isSame(prevCorrectDate, 'day'))) {
        setPrevCorrectDate(lastCorrectDate);
        setFocusedDate(lastCorrectDate);
    }

    const [isOpen, setOpen] = React.useState(false);
    const dialogClosing = React.useRef(false);

    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: props.onFocus,
        onBlurWithin: (e) => {
            props.onBlur?.(e);
            state.confirmValue();
        },
        onFocusWithinChange: (isFocusWithin) => {
            if (!dialogClosing.current) {
                setOpen(isFocusWithin);
            }
        },
    });

    const DOMProps = filterDOMProps(props);
    delete DOMProps.id;

    return {
        groupProps: {
            ...DOMProps,
            ...focusWithinProps,
            role: 'group',
        },
        inputProps: {
            ref: setAnchor,
            size: props.size,
            autoFocus: props.autoFocus,
            value: state.text,
            onUpdate: state.setText,
            disabled: state.disabled,
            hasClear: props.hasClear,
            validationState: state.validationState,
            errorMessage: props.errorMessage,
            errorPlacement: props.errorPlacement,
            label: props.label,
            id: props.id,
            startContent: props.startContent,
            endContent: props.endContent,
            pin: props.pin,
            view: props.view,
            placeholder: props.placeholder,
            onKeyDown: (e) => {
                props.onKeyDown?.(e);
                if (
                    !e.defaultPrevented &&
                    e.altKey &&
                    (e.key === 'ArrowDown' || e.key === 'ArrowUp')
                ) {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(true);
                }
            },
            onKeyUp: props.onKeyUp,
            controlProps: {
                'aria-label': props['aria-label'] || undefined,
                'aria-labelledby': props['aria-labelledby'] || undefined,
                'aria-describedby': props['aria-describedby'] || undefined,
                'aria-details': props['aria-details'] || undefined,
                'aria-disabled': state.disabled || undefined,
                readOnly: state.readOnly,
                onClick: () => {
                    setOpen(true);
                },
            },
        },
        popupProps: {
            anchorElement: anchor,
            open: isOpen,
            onOpenChange: (open) => {
                if (!open) {
                    setOpen(false);
                }
                dialogClosing.current = !open;
            },
            onTransitionOutComplete: () => {
                setTimeout(() => {
                    dialogClosing.current = false;
                });
            },
            placement: props.popupPlacement,
            offset: props.popupOffset,
        },
        calendarProps: {
            size: props.size === 's' ? 'm' : props.size,
            readOnly: true,
            value: state.lastCorrectDate,
            focusedValue: focusedDate,
            onFocusUpdate: setFocusedDate,
        },
        timeInputProps: {
            size: props.size,
            readOnly: true,
            value: state.lastCorrectDate,
            format: 'LTS',
        },
    };
}
