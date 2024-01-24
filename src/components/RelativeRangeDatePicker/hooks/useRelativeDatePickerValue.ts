import React from 'react';

import type {RelativeRangeDatepickerValue} from '../types';
import {isValueEqual} from '../utils/isValueEqual';

type Opts = {
    value?: RelativeRangeDatepickerValue | null;
};

type SetValue = (value: RelativeRangeDatepickerValue | null) => void;

export function useRelativeDatePickerValue(
    opts: Opts,
): [RelativeRangeDatepickerValue | null, SetValue] {
    const {value: optsValue} = opts;

    const [value, setValue] = React.useState(optsValue || null);

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

    return [value, updateValue];
}
