import React from 'react';

import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';

import type {Value} from '../../RelativeDatePicker';

interface Options {
    onUpdate: (value: {start: Value; end: Value}) => void;
    start?: Value | null;
    end?: Value | null;
    timeZone?: string;
}

export const useThinTimelineRuler = ({start, end, onUpdate, timeZone}: Options) => {
    const fromMillis = dateTimeParse(start?.value || '', {timeZone})?.valueOf() ?? NaN;
    const toMillis = dateTimeParse(end?.value || '', {timeZone})?.valueOf() ?? NaN;

    const onUpdateMillis = React.useCallback(
        (updatedValue: {start: number; end: number}) => {
            onUpdate({
                start: {
                    type: 'absolute',
                    value: dateTime({input: updatedValue.start}),
                },
                end: {
                    type: 'absolute',
                    value: dateTime({input: updatedValue.end}),
                },
            });
        },
        [onUpdate],
    );

    return {
        fromMillis,
        toMillis,
        onUpdateMillis,
    };
};
