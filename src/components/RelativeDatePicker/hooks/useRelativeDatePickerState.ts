import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import {adjustDateToFormat} from '../../DateField/utils';
import {useDatePickerState} from '../../DatePicker';
import type {DatePickerState} from '../../DatePicker';
import {useRelativeDateFieldState} from '../../RelativeDateField';
import type {RelativeDateFieldState} from '../../RelativeDateField';
import type {DateFieldBase} from '../../types';

export type Value =
    | {
          type: 'absolute';
          value: DateTime;
      }
    | {
          type: 'relative';
          value: string;
      };

export type RelativeDatePickerMode = Value['type'];

export interface RelativeDatePickerStateOptions extends DateFieldBase<Value> {
    /** Round up parsed date to the nearest granularity. */
    roundUp?: boolean;
}

export interface RelativeDatePickerState {
    value: Value | null;
    setValue: (value: Value | null) => void;
    mode: RelativeDatePickerMode;
    setMode: (mode: RelativeDatePickerMode) => void;
    datePickerState: DatePickerState;
    relativeDateState: RelativeDateFieldState;
    selectedDate: DateTime | null;
    /**
     * Whether the field is disabled.
     */
    disabled?: boolean;
    /**
     * Whether the value is immutable.
     */
    readOnly?: boolean;
    isActive: boolean;
    setActive: (isActive: boolean) => void;
}

export function useRelativeDatePickerState(
    props: RelativeDatePickerStateOptions,
): RelativeDatePickerState {
    const [value, setValue] = useControlledState(
        props.value,
        props.defaultValue ?? null,
        props.onUpdate,
    );

    const [mode, setMode] = React.useState<Value['type']>(
        value?.type === 'relative' ? 'relative' : 'absolute',
    );

    const [prevValue, setPrevValue] = React.useState(value);
    if (value !== prevValue) {
        setPrevValue(value);
        if (value && value.type !== mode) {
            setMode(value.type);
        }
    }

    const [valueDate, setValueDate] = React.useState(
        value?.type === 'absolute' ? value.value : null,
    );

    if (value?.type === 'absolute' && value.value !== valueDate) {
        setValueDate(value.value);
    }

    const datePickerState = useDatePickerState({
        value: valueDate,
        onUpdate: (date) => {
            let newDate = date;
            if (newDate && props.roundUp) {
                newDate = adjustDateToFormat(newDate, datePickerState.formatInfo, 'endOf');
                if (!datePickerState.formatInfo.hasTime) {
                    newDate = newDate.endOf('day');
                }
            }
            setValueDate(newDate);

            if (value?.type === 'absolute' && newDate?.isSame(value.value)) {
                return;
            }

            setValue(newDate ? {type: 'absolute', value: newDate} : null);
        },
        format: props.format,
        placeholderValue: props.placeholderValue,
        timeZone: props.timeZone,
        disabled: props.disabled,
        readOnly: props.readOnly,
        minValue: props.minValue,
        maxValue: props.maxValue,
    });

    const [valueRelative, setValueRelative] = React.useState(
        value?.type === 'relative' ? value.value : null,
    );

    if (value?.type === 'relative' && value.value !== valueRelative) {
        setValueRelative(value.value);
    }

    const relativeDateState = useRelativeDateFieldState({
        value: valueRelative,
        onUpdate: (v) => {
            setValueRelative(v);

            if (value?.type === 'relative' && v === value.value) {
                return;
            }

            setValue(v ? {type: 'relative', value: v} : null);
        },
        disabled: props.disabled,
        readOnly: props.readOnly,
        timeZone: datePickerState.timeZone,
        roundUp: props.roundUp,
    });

    if (!value) {
        if (mode === 'absolute' && valueDate) {
            setValueDate(null);
        } else if (mode === 'relative' && valueRelative) {
            setValueRelative(null);
        }
    }

    const selectedDate =
        mode === 'relative'
            ? relativeDateState.parsedDate
            : datePickerState.dateFieldState.displayValue;

    const [isActive, setActive] = React.useState(false);

    return {
        value,
        setValue(v) {
            if (props.readOnly || props.disabled) {
                return;
            }

            setValue(v);
        },
        disabled: props.disabled,
        readOnly: props.readOnly,
        mode,
        setMode(newMode: RelativeDatePickerMode) {
            if (props.readOnly || props.disabled || newMode === mode) {
                return;
            }

            setMode(newMode);
            if (newMode === 'relative') {
                if ((!value && valueRelative) || value) {
                    setValue(valueRelative ? {type: 'relative', value: valueRelative} : null);
                }
            } else if ((!value && valueDate) || value) {
                setValue(valueDate ? {type: 'absolute', value: valueDate} : null);
            }
        },
        datePickerState,
        relativeDateState,
        selectedDate,
        isActive,
        setActive,
    };
}
