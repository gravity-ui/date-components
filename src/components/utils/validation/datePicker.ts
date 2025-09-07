import type {DateTime} from '@gravity-ui/date-utils';

import type {ExtractFunctionType} from '../../types';

import {i18n} from './i18n';

export interface ValidationResult {
    isInvalid: boolean;
    errors: string[];
}

export function getValidationResult(
    value: DateTime | null | undefined,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
    isDateUnavailable: ((v: DateTime) => boolean) | undefined,
    timeZone: string,
    valueTitle = 'Value',
    t: ExtractFunctionType<typeof i18n> = i18n,
): ValidationResult {
    const rangeOverflow = value && maxValue && maxValue.isBefore(value);
    const rangeUnderflow = value && minValue && value.isBefore(minValue);
    const isUnavailable = (value && isDateUnavailable?.(value)) || false;
    const isInvalid = rangeOverflow || rangeUnderflow || isUnavailable;
    const errors = [];

    if (isInvalid) {
        if (rangeUnderflow && minValue) {
            errors.push(
                t('Value must be {minValue} or later.', {
                    minValue: minValue.timeZone(timeZone).format(),
                    value: valueTitle,
                }),
            );
        }

        if (rangeOverflow && maxValue) {
            errors.push(
                t('Value must be {maxValue} or earlier.', {
                    maxValue: maxValue.timeZone(timeZone).format(),
                    value: valueTitle,
                }),
            );
        }

        if (isUnavailable) {
            errors.push(t('Selected date unavailable.'));
        }
    }

    return {isInvalid, errors};
}
