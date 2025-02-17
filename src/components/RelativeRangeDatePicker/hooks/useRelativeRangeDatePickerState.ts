import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {Value} from '../../RelativeDatePicker';
import type {RangeValue} from '../../types';
import {getValidationResult} from '../../utils/validation/datePicker';
import {i18n} from '../i18n';

export type RelativeRangeDatePickerValue = RangeValue<Value | null>;

export interface RelativeRangeDatePickerState {
    value: RelativeRangeDatePickerValue | null;
    timeZone: string;
    setValue: (value: RelativeRangeDatePickerValue | null, timeZone: string) => void;
    isInvalid: boolean;
    errors: string[];
}

export interface RelativeRangeDatePickerStateOptions {
    value?: RelativeRangeDatePickerValue | null;
    defaultValue?: RelativeRangeDatePickerValue;
    onUpdate?: (value: RelativeRangeDatePickerValue | null, timeZone: string) => void;
    timeZone?: string;
    defaultTimeZone?: string;
    onUpdateTimeZone?: (timeZone: string) => void;
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
    /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
    isDateUnavailable?: (date: DateTime, endpoint: 'start' | 'end') => boolean;
    allowNullableValues?: boolean;
}

export function useRelativeRangeDatePickerState(
    props: RelativeRangeDatePickerStateOptions,
): RelativeRangeDatePickerState {
    const [value, setValue] = useControlledState(props.value, props.defaultValue ?? null);

    const [timeZone, setTimeZone] = useControlledState(
        props.timeZone,
        props.defaultTimeZone ?? 'default',
        props.onUpdateTimeZone,
    );

    const validation = React.useMemo(
        () =>
            getRangeValidationResult(
                value,
                props.allowNullableValues,
                props.minValue,
                props.maxValue,
                props.isDateUnavailable,
                timeZone,
            ),
        [
            value,
            props.allowNullableValues,
            props.isDateUnavailable,
            props.maxValue,
            props.minValue,
            timeZone,
        ],
    );

    return {
        value,
        timeZone,
        setValue(v, tz) {
            setValue(v);
            setTimeZone(tz);
            if (value !== v || (value && timeZone !== tz)) {
                props.onUpdate?.(v, tz);
            }
        },
        ...validation,
    };
}

export function getRangeValidationResult(
    value: RelativeRangeDatePickerValue | null,
    allowNullableValues: boolean | undefined,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
    isDateUnavailable: ((v: DateTime, endpoint: 'start' | 'end') => boolean) | undefined,
    timeZone: string,
) {
    if (!value) {
        return {isInvalid: false, errors: []};
    }

    const startDate = value.start ? dateTimeParse(value.start.value, {timeZone}) : null;
    const endDate = value.end ? dateTimeParse(value.end.value, {timeZone, roundUp: true}) : null;

    const startValidationResult = getValidationResult(
        startDate,
        minValue,
        maxValue,
        isDateUnavailable ? (date) => isDateUnavailable(date, 'start') : undefined,
        timeZone,
        i18n('"From"'),
    );

    if (!startDate && !allowNullableValues) {
        startValidationResult.isInvalid = true;
        startValidationResult.errors.push(i18n('"From" is required.'));
    }

    const endValidationResult = getValidationResult(
        endDate,
        minValue,
        maxValue,
        isDateUnavailable ? (date) => isDateUnavailable(date, 'end') : undefined,
        timeZone,
        i18n('"To"'),
    );

    if (!endDate && !allowNullableValues) {
        endValidationResult.isInvalid = true;
        endValidationResult.errors.push(i18n('"To" is required.'));
    }

    if (startDate && endDate && endDate.isBefore(startDate)) {
        startValidationResult.isInvalid = true;
        startValidationResult.errors.push(i18n(`"From" can't be after "To".`));
    }

    return {
        isInvalid: startValidationResult.isInvalid || endValidationResult.isInvalid,
        startValidationResult,
        endValidationResult,
        errors: startValidationResult.errors.concat(endValidationResult.errors),
    };
}
