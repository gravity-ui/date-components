import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {RelativeRangeDatePickerProps} from '../../../RelativeRangeDatePicker';
import {SECOND} from '../../constants';
import {useReferentiallyConstantObject} from '../../hooks';
import {getDurationFromValue, getHighestRoundedDuration} from '../../utils/duration';
import {UNIT_SPAN, lerp} from '../../utils/spans';

interface Options {
    value: RelativeRangeDatePickerProps['value'];
    onUpdate: (value: RelativeRangeDatePickerProps['value']) => void;
    stickToNow: boolean;
    pointOfMaxInterest: number;
}

function absolutizeDatetime(dt: string, isPeriodEnd: boolean): DateTime | undefined {
    const parsed = dateTimeParse(dt, {
        allowRelative: true,
        roundUp: isPeriodEnd,
        timeZone: 'UTC',
    });
    if (!parsed) {
        return undefined;
    }

    return parsed;
}
function relativizeDatetime(msFromNow: number): string {
    const abs = Math.abs(msFromNow);
    if (abs < SECOND) {
        return 'now';
    }
    const duration = getHighestRoundedDuration(getDurationFromValue(abs));
    return ['now', duration].join(msFromNow > 0 ? '+' : '-');
}

export const useStickToNowSwitcher = ({
    value,
    stickToNow,
    pointOfMaxInterest,
    onUpdate,
}: Options) => {
    const lateBoundProps = useReferentiallyConstantObject({
        from: value?.start,
        to: value?.end,
        stickToNow,
        onUpdate,
        pointOfMaxInterest,
    });

    const enableStickToNow = React.useCallback(() => {
        const roundUp = lateBoundProps.from?.value === lateBoundProps.to?.value;
        const fromMillis = dateTimeParse(lateBoundProps.from?.value || '', {
            timeZone: 'UTC',
        })?.valueOf();
        const toMillis = dateTimeParse(lateBoundProps.to?.value || '', {
            roundUp,
            timeZone: 'UTC',
        })?.valueOf();
        if (typeof fromMillis !== 'number' || typeof toMillis !== 'number') {
            return;
        }

        const poiTime = lerp(
            UNIT_SPAN,
            {start: fromMillis, end: toMillis},
            lateBoundProps.pointOfMaxInterest,
        );
        const now = Date.now();
        const dt = now - poiTime;
        lateBoundProps.onUpdate({
            start: {
                type: 'relative',
                value: relativizeDatetime(fromMillis + dt - now),
            },
            end: {
                type: 'relative',
                value: relativizeDatetime(toMillis + dt - now),
            },
        });
    }, [lateBoundProps]);

    const disableStickToNow = React.useCallback(() => {
        const absFrom = absolutizeDatetime(
            typeof lateBoundProps.from?.value === 'string' ? lateBoundProps.from?.value : '',
            false,
        );
        if (!absFrom) {
            return;
        }
        const absTo = absolutizeDatetime(
            typeof lateBoundProps.to?.value === 'string' ? lateBoundProps.to?.value : '',
            true,
        );
        if (!absTo) {
            return;
        }

        lateBoundProps.onUpdate({
            start: {type: 'absolute', value: absFrom},
            end: {type: 'absolute', value: absTo},
        });
    }, [lateBoundProps]);

    const toggleStickToNow = React.useCallback(() => {
        if (lateBoundProps.stickToNow) {
            disableStickToNow();
        } else {
            enableStickToNow();
        }
    }, [disableStickToNow, enableStickToNow, lateBoundProps]);

    return {enableStickToNow, disableStickToNow, toggleStickToNow};
};
