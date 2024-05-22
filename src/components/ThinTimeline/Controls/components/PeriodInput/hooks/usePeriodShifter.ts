import React from 'react';

import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';

import type {RelativeRangeDatePickerProps} from '../../../../../RelativeRangeDatePicker';

interface UsePeriodShifterOptions {
    period: RelativeRangeDatePickerProps['value'];
    onUpdate: (value: RelativeRangeDatePickerProps['value']) => void;
    coeff: number;
}

export const usePeriodShifter = ({period, onUpdate, coeff}: UsePeriodShifterOptions) => {
    return React.useCallback(() => {
        const fromMillis = dateTimeParse(period?.start?.value || '', {
            allowRelative: true,
            timeZone: 'UTC',
        })?.valueOf();
        if (typeof fromMillis !== 'number') {
            return;
        }

        const toMillis = dateTimeParse(period?.end?.value || '', {
            allowRelative: true,
            roundUp: true,
            timeZone: 'UTC',
        })?.valueOf();
        if (typeof toMillis !== 'number') {
            return;
        }

        const dt = coeff * (toMillis - fromMillis);
        onUpdate({
            start: {
                type: 'absolute',
                value: dateTime({input: fromMillis + dt}),
            },
            end: {
                type: 'absolute',
                value: dateTime({input: toMillis + dt}),
            },
        });
    }, [coeff, onUpdate, period]);
};
