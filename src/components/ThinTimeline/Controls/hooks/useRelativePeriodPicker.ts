import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTimeOptionsWhenParsing} from '@gravity-ui/date-utils/build/typings';

import type {RelativeRangeDatePickerProps} from '../../../RelativeRangeDatePicker';

const PARSE_OPTS: DateTimeOptionsWhenParsing = {
    allowRelative: true,
    timeZone: 'UTC',
};

export const useRelativePeriodPicker = (
    onUpdate: (period: RelativeRangeDatePickerProps['value']) => void,
) => {
    return React.useCallback(
        (period: string) => {
            const isValid = Boolean(dateTimeParse('now-' + period, PARSE_OPTS));
            if (!isValid) {
                return;
            }
            onUpdate({
                start: {
                    type: 'relative',
                    value: 'now-' + period,
                },
                end: {
                    type: 'relative',
                    value: 'now',
                },
            });
        },
        [onUpdate],
    );
};
