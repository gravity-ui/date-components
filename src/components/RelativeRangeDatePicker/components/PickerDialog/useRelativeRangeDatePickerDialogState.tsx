import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {Value} from '../../../RelativeDatePicker';
import type {RangeValue} from '../../../types';
import {getRangeValidationResult} from '../../hooks/useRelativeRangeDatePickerState';

import type {PickerFormProps} from './PickerForm';

export function useRelativeRangeDatePickerDialogState(props: PickerFormProps) {
    const [userTimeZone, setUserTimeZone] = useControlledState(
        props.timeZone,
        props.defaultTimeZone ?? 'default',
        props.onUpdateTimeZone,
    );

    const [value, setValue] = useControlledState(
        props.value,
        props.defaultValue ?? null,
        (v, tz: string) => {
            setUserTimeZone(tz);
            if (value !== v || (value && userTimeZone !== tz)) {
                props.onUpdate?.(v, tz);
            }
        },
    );

    const {withApplyButton} = props;

    const [start, setStart] = React.useState<Value | null>(value?.start ?? null);
    const [end, setEnd] = React.useState<Value | null>(value?.end ?? null);
    const [innerTimeZone, setTimeZone] = React.useState(userTimeZone);

    const timeZone = withApplyButton ? innerTimeZone : userTimeZone;
    const allowNullableValues = props.allowNullableValues;

    function setStartValue(newValue: Value | null) {
        if (props.readOnly) {
            return;
        }
        setStart(newValue);
        if (!withApplyButton) {
            setValue(
                getRangeValue(newValue, end, {...props, timeZone, allowNullableValues}),
                timeZone,
            );
        }
    }

    function setEndValue(newValue: Value | null) {
        if (props.readOnly) {
            return;
        }
        setEnd(newValue);
        if (!withApplyButton) {
            setValue(
                getRangeValue(start, newValue, {...props, timeZone, allowNullableValues}),
                timeZone,
            );
        }
    }

    function setTimeZoneValue(newTimeZone: string) {
        if (props.readOnly) {
            return;
        }
        setTimeZone(newTimeZone);
        const newStart = start ? {...start} : start;
        if (newStart?.type === 'absolute') {
            newStart.value = newStart.value.timeZone(newTimeZone, true);
            setStart(newStart);
        }
        const newEnd = end ? {...end} : end;
        if (newEnd?.type === 'absolute') {
            newEnd.value = newEnd.value.timeZone(newTimeZone, true);
            setEnd(newEnd);
        }
        if (!withApplyButton) {
            setValue(
                getRangeValue(newStart, newEnd, {
                    ...props,
                    timeZone: newTimeZone,
                    allowNullableValues,
                }),
                newTimeZone,
            );
        }
    }

    function setRange(newStart: Value | null, newEnd: Value | null) {
        if (props.readOnly) {
            return;
        }
        setStart(newStart);
        setEnd(newEnd);
        if (!withApplyButton) {
            setValue(
                getRangeValue(newStart, newEnd, {...props, timeZone, allowNullableValues}),
                timeZone,
            );
        }
    }

    function applyValue() {
        if (props.readOnly) {
            return;
        }
        setValue(getRangeValue(start, end, {...props, timeZone, allowNullableValues}), timeZone);
    }

    const validation = React.useMemo(
        () =>
            getRangeValidationResult(
                start || end ? {start, end} : null,
                allowNullableValues,
                props.minValue,
                props.maxValue,
                props.isDateUnavailable,
                timeZone,
            ),
        [
            allowNullableValues,
            end,
            props.isDateUnavailable,
            props.maxValue,
            props.minValue,
            start,
            timeZone,
        ],
    );

    return {
        start,
        end,
        timeZone,
        setStart: setStartValue,
        setEnd: setEndValue,
        setRange,
        setTimeZone: setTimeZoneValue,
        applyValue,
        isInvalid: validation.isInvalid,
        startValidation: validation.startValidationResult,
        endValidation: validation.endValidationResult,
    };
}

interface GetRangeValueOptions {
    allowNullableValues?: boolean;
    minValue?: DateTime;
    maxValue?: DateTime;
    isDateUnavailable?: (v: DateTime, endPoint: 'start' | 'end') => boolean;
    timeZone?: string;
}
function getRangeValue(
    start: Value | null,
    end: Value | null,
    options: GetRangeValueOptions = {},
): RangeValue<Value | null> | null {
    if (!start && !end) {
        return null;
    }

    const {isInvalid} = getRangeValidationResult(
        {start, end},
        options.allowNullableValues,
        options.minValue,
        options.maxValue,
        options.isDateUnavailable,
        options.timeZone ?? 'default',
    );

    if (isInvalid) {
        return null;
    }

    return {start, end};
}
