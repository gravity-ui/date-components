import React from 'react';

import {dateTimeParse, isValid} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import type {TextInputProps} from '@gravity-ui/uikit';

import {useControlledState} from '../../hooks/useControlledState';

export interface RelativeDateFieldState {
    /** The current field value. */
    value: string;
    /** */
    setValue: (v: string) => void;
    /** */
    parsedDate: DateTime | null;
    /** */
    lastCorrectDate: DateTime | null;
    /** */
    validationStatus?: 'invalid';
    /**
     * Whether the field is disabled.
     */
    disabled?: boolean;
    /**
     * Whether the value is immutable.
     */
    readOnly?: boolean;
}

interface RelativeDateFieldOptions {
    /** The current value (controlled). */
    value?: string | null;
    /** The default value (uncontrolled). */
    defaultValue?: string;
    /** Handler that is called when the value changes. */
    onUpdate?: (value: string | null) => void;
    /**
     * Whether the field is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the value is immutable.
     * @default false
     */
    readOnly?: boolean;
    /** Validation error */
    error?: TextInputProps['error'];
}
export function useRelativeDateFieldState(props: RelativeDateFieldOptions): RelativeDateFieldState {
    const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onUpdate);

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
        return dateTimeParse(value) ?? null;
    }, [value]);

    const [lastCorrectDate, setLastCorrectDate] = React.useState(parsedDate);
    if (parsedDate && parsedDate !== lastCorrectDate) {
        setLastCorrectDate(parsedDate);
    }

    const validationStatus = text && !parsedDate ? 'invalid' : undefined;

    return {
        value: text,
        setValue: handleTextChange,
        parsedDate,
        lastCorrectDate,
        validationStatus,
        disabled: props.disabled,
        readOnly: props.readOnly,
    };
}

function isLikeRelativeDate(text: string) {
    return /^now/i.test(text);
}
