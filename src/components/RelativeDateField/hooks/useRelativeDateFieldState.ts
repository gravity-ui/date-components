import React from 'react';

import {dateTimeParse, isValid} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {InputBase, Validation, ValueBase} from '../../types';

export interface RelativeDateFieldState {
    /** The current field value. */
    value: string | null;
    /** Sets the field value */
    setValue: (v: string | null) => void;
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
}
export function useRelativeDateFieldState(props: RelativeDateFieldOptions): RelativeDateFieldState {
    const [value, setValue] = useControlledState(
        props.value,
        props.defaultValue ?? null,
        props.onUpdate,
    );

    const [text, setText] = React.useState(value ?? '');
    if (value && value !== text) {
        setText(value);
    }

    const handleTextChange = (t: string) => {
        if (props.disabled || props.readOnly) {
            return;
        }
        setText(t);
        if (isLikeRelativeDate(t)) {
            const date = dateTimeParse(t);
            if (date && isValid(date)) {
                setValue(t);
            } else {
                setValue(null);
            }
        } else {
            setValue(null);
        }
    };

    const parsedDate = React.useMemo(() => {
        if (!value) {
            return null;
        }
        return dateTimeParse(value, {timeZone: props.timeZone}) ?? null;
    }, [value, props.timeZone]);

    const [lastCorrectDate, setLastCorrectDate] = React.useState(parsedDate);
    if (parsedDate && parsedDate !== lastCorrectDate) {
        setLastCorrectDate(parsedDate);
    }

    const validationState = props.validationState || (text && !parsedDate) ? 'invalid' : undefined;

    return {
        value,
        setValue(v: string | null) {
            if (props.disabled || props.readOnly) {
                return;
            }

            setValue(v);
        },
        text,
        setText: handleTextChange,
        parsedDate,
        lastCorrectDate,
        validationState,
        disabled: props.disabled,
        readOnly: props.readOnly,
    };
}

function isLikeRelativeDate(text: string) {
    return /^now/i.test(text);
}
