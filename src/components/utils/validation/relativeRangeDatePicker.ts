import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {RelativeRangeDatePickerValue} from '../../RelativeRangeDatePicker';
import type {ExtractFunctionType} from '../../types';

import {getValidationResult} from './datePicker';
import {i18n} from './i18n';

export function getRangeValidationResult(
    value: RelativeRangeDatePickerValue | null,
    allowNullableValues: boolean | undefined,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
    isDateUnavailable: ((v: DateTime, endpoint: 'start' | 'end') => boolean) | undefined,
    timeZone: string,
    t: ExtractFunctionType<typeof i18n> = i18n,
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
        t('"From"'),
        t,
    );

    if (!startDate && !allowNullableValues) {
        startValidationResult.isInvalid = true;
        startValidationResult.errors.push(t('"From" is required.'));
    }

    const endValidationResult = getValidationResult(
        endDate,
        minValue,
        maxValue,
        isDateUnavailable ? (date) => isDateUnavailable(date, 'end') : undefined,
        timeZone,
        t('"To"'),
        t,
    );

    if (!endDate && !allowNullableValues) {
        endValidationResult.isInvalid = true;
        endValidationResult.errors.push(t('"To" is required.'));
    }

    if (startDate && endDate && endDate.isBefore(startDate)) {
        startValidationResult.isInvalid = true;
        startValidationResult.errors.push(t(`"From" can't be after "To".`));
    }

    return {
        isInvalid: startValidationResult.isInvalid || endValidationResult.isInvalid,
        startValidationResult,
        endValidationResult,
        errors: startValidationResult.errors.concat(endValidationResult.errors),
    };
}
