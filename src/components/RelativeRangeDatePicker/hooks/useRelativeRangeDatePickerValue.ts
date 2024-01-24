import React from 'react';

import {type DateTime} from '@gravity-ui/date-utils';

import type {RelativeRangeDatepickerValue} from '../types';
import {getErrors} from '../utils';
import {isValueEqual} from '../utils/isValueEqual';
import {updateTimeZone} from '../utils/updateTimeZone';

type Opts = {
    value?: RelativeRangeDatepickerValue | null;
    timeZone?: string;
    minValue?: DateTime;
    maxValue?: DateTime;
    onUpdate?: (value: RelativeRangeDatepickerValue | null) => void;
    allowNullableValues?: boolean;
};

type SetValue = (value: RelativeRangeDatepickerValue | null) => void;

export function useRelativeRangeDatePickerValue(
    opts: Opts,
): [RelativeRangeDatepickerValue | null, SetValue, ReturnType<typeof getErrors>] {
    const {value: optsValue, timeZone, minValue, maxValue, allowNullableValues = true} = opts;
    const onUpdateRef = React.useRef(opts.onUpdate);
    onUpdateRef.current = opts.onUpdate;

    const [value, setValue] = React.useState(updateTimeZone(optsValue || null, timeZone));
    const errors = getErrors({value, minValue, maxValue, allowNullableValues});
    const isValid = !errors.startError && !errors.endError;
    const prevValueRef = React.useRef(optsValue || value);

    React.useEffect(() => {
        setValue((prevValue) => {
            return updateTimeZone(prevValue, timeZone);
        });
    }, [timeZone]);

    const updateValue = React.useCallback((newValue: RelativeRangeDatepickerValue | null) => {
        setValue((prevValue) => {
            if (isValueEqual(newValue, prevValue)) {
                return prevValue;
            }
            return newValue;
        });
    }, []);

    React.useEffect(() => {
        updateValue(optsValue || null);
    }, [optsValue, updateValue]);

    React.useEffect(() => {
        if (isValid && !isValueEqual(prevValueRef.current, value)) {
            onUpdateRef.current?.(value);
        }
        prevValueRef.current = value;
    }, [isValid, value]);

    return [value, updateValue, errors];
}
