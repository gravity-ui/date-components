import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

export function useDefaultTimeZone(date: DateTime | null | undefined) {
    const defaultTimeZone = date ? date.timeZone() : 'default';

    const [lastValue, setLastValue] = React.useState(defaultTimeZone);

    if (date && defaultTimeZone !== lastValue) {
        setLastValue(defaultTimeZone);
    }

    const timeZone = date ? defaultTimeZone : lastValue;
    return timeZone;
}
