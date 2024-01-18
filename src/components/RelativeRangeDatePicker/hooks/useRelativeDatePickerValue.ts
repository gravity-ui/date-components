import React from 'react';

import type {RelativeRangeDatepickerValue} from '../types';
import {isValueEqual} from '../utils/isValueEqual';
import {updateTimeZone} from '../utils/updateTimeZone';

type Opts = {
    timeZone?: string;
    value?: RelativeRangeDatepickerValue | null;
};

type SetValue = (value: RelativeRangeDatepickerValue | null) => void;

export function useRelativeDatePickerValue(
    opts: Opts,
): [RelativeRangeDatepickerValue | null, SetValue] {
    const {timeZone, value: optsValue} = opts;

    const [value, setValue] = React.useState(updateTimeZone(optsValue || null, timeZone));

    const updateValue = React.useCallback(
        (value?: RelativeRangeDatepickerValue | null) => {
            setValue((prevValue) => {
                const newValue = updateTimeZone(value === undefined ? prevValue : value, timeZone);
                if (isValueEqual(newValue, prevValue)) {
                    return prevValue;
                }
                return newValue;
            });
        },
        [timeZone],
    );

    React.useEffect(() => {
        updateValue(optsValue);
    }, [optsValue, updateValue]);

    return [value, updateValue];
}
