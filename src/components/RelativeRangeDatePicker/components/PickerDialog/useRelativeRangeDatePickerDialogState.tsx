import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {Value} from '../../../RelativeDatePicker';
import type {RangeValue} from '../../../types';
import {getValidationResult} from '../../../utils/validation/datePicker';
import type {RelativeRangeDatePickerProps} from '../../RelativeRangeDatePicker';
import type {RelativeRangeDatePickerState} from '../../hooks/useRelativeRangeDatePickerState';

import {i18n} from './i18n';

export function useRelativeRangeDatePickerDialogState(
    state: RelativeRangeDatePickerState,
    props: RelativeRangeDatePickerProps,
) {
    const {withApplyButton, allowNullableValues} = props;

    const [start, setStart] = React.useState<Value | null>(state.value?.start ?? null);
    const [end, setEnd] = React.useState<Value | null>(state.value?.end ?? null);
    const [innerTimeZone, setTimeZone] = React.useState(state.timeZone);

    const timeZone = withApplyButton ? innerTimeZone : state.timeZone;

    function setStartValue(newValue: Value | null) {
        setStart(newValue);
        if (!withApplyButton) {
            state.setValue(getRangeValue(newValue, end, {...props, timeZone}), timeZone);
        }
    }

    function setEndValue(newValue: Value | null) {
        setEnd(newValue);
        if (!withApplyButton) {
            state.setValue(getRangeValue(start, newValue, {...props, timeZone}), timeZone);
        }
    }

    function setTimeZoneValue(newTimeZone: string) {
        setTimeZone(newTimeZone);
        if (!withApplyButton) {
            state.setValue(
                getRangeValue(start, end, {...props, timeZone: newTimeZone}),
                newTimeZone,
            );
        }
    }

    function setRange(newStart: Value, newEnd: Value) {
        setStart(newStart);
        setEnd(newEnd);
        if (!withApplyButton) {
            state.setValue(getRangeValue(newStart, newEnd, {...props, timeZone}), timeZone);
        }
    }

    function applyValue() {
        state.setValue(getRangeValue(start, end, {...props, timeZone}), timeZone);
    }

    const validation = React.useMemo(
        () =>
            getRangeValidationResult(
                start,
                end,
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
    isDateUnavailable?: (v: DateTime) => boolean;
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
        start,
        end,
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

function getRangeValidationResult(
    start: Value | null | undefined,
    end: Value | null | undefined,
    allowNullableValues: boolean | undefined,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
    isDateUnavailable: ((v: DateTime) => boolean) | undefined,
    timeZone: string,
) {
    if (!start && !end) {
        return {isInvalid: false};
    }

    const startDate = start ? dateTimeParse(start.value, {timeZone}) : null;
    const endDate = end ? dateTimeParse(end.value, {timeZone, roundUp: true}) : null;

    const startValidationResult = getValidationResult(
        startDate,
        minValue,
        maxValue,
        isDateUnavailable,
        timeZone,
    );

    if (!startDate && !allowNullableValues) {
        startValidationResult.isInvalid = true;
        startValidationResult.errors.push(i18n('Value is required.'));
    }

    const endValidationResult = getValidationResult(
        endDate,
        minValue,
        maxValue,
        isDateUnavailable,
        timeZone,
    );

    if (!endDate && !allowNullableValues) {
        endValidationResult.isInvalid = true;
        endValidationResult.errors.push(i18n('Value is required.'));
    }

    if (startDate && endDate && endDate.isBefore(startDate)) {
        startValidationResult.isInvalid = true;
        startValidationResult.errors.push(i18n(`"From" can't be after "To".`));
    }

    return {
        isInvalid: startValidationResult.isInvalid || endValidationResult.isInvalid,
        startValidationResult,
        endValidationResult,
    };
}
