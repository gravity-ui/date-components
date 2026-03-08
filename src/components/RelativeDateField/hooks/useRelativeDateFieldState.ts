import React from 'react';

import {dateTimeParse, isLikeRelative} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {InputBase, Validation, ValueBase} from '../../types';

export interface RelativeDateFieldState {
    /** The current field value. */
    value: string | null;
    /** Sets the field value */
    setValue: (v: string | null) => void;
    /** Commits current text value on blur. */
    confirmValue: () => void;
    /** Current user input */
    text: string;
    /** Sets text */
    setText: (t: string) => void;
    /** */
    parsedDate: DateTime | null;
    /** */
    lastCorrectDate: DateTime | null;
    /** */
    validationState?: 'invalid';
    /**
     * Whether the field is disabled.
     */
    disabled?: boolean;
    /**
     * Whether the value is immutable.
     */
    readOnly?: boolean;
}

export interface RelativeDateFieldOptions extends ValueBase<string | null>, InputBase, Validation {
    timeZone?: string;
    /** Round up parsed date to the nearest granularity. */
    roundUp?: boolean;
}
export function useRelativeDateFieldState(props: RelativeDateFieldOptions): RelativeDateFieldState {
    const [value, setValue] = useControlledState(
        props.value,
        props.defaultValue ?? '',
        props.onUpdate,
    );

    const [text, setText] = React.useState(value ?? '');
    const [lastValue, setLastValue] = React.useState(value);
    if (value !== lastValue) {
        setLastValue(value);
        setText(value ?? '');
    }

    const parseRelativeDate = React.useCallback(
        (relativeValue: string | null) => {
            if (!isLikeRelative(relativeValue)) {
                return null;
            }

            const date = dateTimeParse(relativeValue, {
                timeZone: props.timeZone,
                roundUp: props.roundUp,
            });

            return date?.isValid() ? date : null;
        },
        [props.roundUp, props.timeZone],
    );

    const parsedDate = React.useMemo(() => parseRelativeDate(text), [parseRelativeDate, text]);

    const [lastCorrectDate, setLastCorrectDate] = React.useState(parsedDate);
    if (parsedDate && (!lastCorrectDate || !parsedDate.isSame(lastCorrectDate))) {
        setLastCorrectDate(parsedDate);
    }

    const commitValue = React.useCallback(
        (nextValue: string | null) => {
            if (props.disabled || props.readOnly) {
                return;
            }

            setValue(nextValue);
        },
        [props.disabled, props.readOnly, setValue],
    );

    const confirmValue = React.useCallback(() => {
        if (!text) {
            return;
        }

        if (parsedDate) {
            commitValue(text);
            return;
        }

        const newValue = parseRelativeDate(value) ? value : null;
        setText(newValue ?? '');
        commitValue(newValue);
    }, [commitValue, parseRelativeDate, parsedDate, text, value]);

    const handleTextChange = React.useCallback(
        (t: string) => {
            if (props.disabled || props.readOnly) {
                return;
            }

            setText(t);

            if (!t) {
                setValue(null);
                return;
            }

            if (parseRelativeDate(t)) {
                setValue(t);
            }
        },
        [parseRelativeDate, props.disabled, props.readOnly, setValue],
    );

    const validationState = props.validationState ?? (text && !parsedDate ? 'invalid' : undefined);

    return {
        value,
        setValue: commitValue,
        confirmValue,
        text,
        setText: handleTextChange,
        parsedDate,
        lastCorrectDate,
        validationState,
        disabled: props.disabled,
        readOnly: props.readOnly,
    };
}
