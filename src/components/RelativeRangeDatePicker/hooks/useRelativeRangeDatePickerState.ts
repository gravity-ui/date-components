import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {Value} from '../../RelativeDatePicker';
import type {RangeValue} from '../../types';
import {i18n} from '../../utils/validation/i18n';
import {getRangeValidationResult} from '../../utils/validation/relativeRangeDatePicker';

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

    const {t} = i18n.useTranslation();
    const validation = React.useMemo(
        () =>
            getRangeValidationResult(
                value,
                props.allowNullableValues,
                props.minValue,
                props.maxValue,
                props.isDateUnavailable,
                timeZone,
                t,
            ),
        [
            value,
            props.allowNullableValues,
            props.isDateUnavailable,
            props.maxValue,
            props.minValue,
            timeZone,
            t,
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
