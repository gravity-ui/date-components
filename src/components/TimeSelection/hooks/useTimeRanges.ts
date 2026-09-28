import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import type {TimeSelectionView, WheelValue} from '../TimeSelection.types';

interface UseTimeRangesProps {
    ampm?: boolean;
    timeSteps?: Partial<Record<TimeSelectionView, number>>;
    isTimeDisabled?: (value: DateTime, view: TimeSelectionView) => boolean;
    minValue?: DateTime;
    maxValue?: DateTime;
    value?: DateTime;
}

const DEFAULT_TIME_STEPS: Record<TimeSelectionView, number> = {
    hours: 1,
    minutes: 1,
    seconds: 1,
};

const isWithinRange = (testValue: DateTime, minValue?: DateTime, maxValue?: DateTime): boolean => {
    if (minValue && testValue.isBefore(minValue)) {
        return false;
    }
    if (maxValue && testValue.isAfter(maxValue)) {
        return false;
    }
    return true;
};

const generateRange = (
    start: number,
    end: number,
    step: number,
    baseValue: DateTime | undefined,
    view: TimeSelectionView,
    isTimeDisabled?: (value: DateTime, view: TimeSelectionView) => boolean,
    minValue?: DateTime,
    maxValue?: DateTime,
): WheelValue[] => {
    const range: WheelValue[] = [];

    for (let i = start; i <= end; i += step) {
        const label = String(i).padStart(2, '0');
        let disabled = false;

        if (baseValue) {
            const unitKey = view === 'hours' ? 'hour' : view === 'minutes' ? 'minute' : 'second';
            const testValue = baseValue.set(unitKey, i);

            if (!isWithinRange(testValue, minValue, maxValue)) {
                disabled = true;
            }

            if (!disabled && isTimeDisabled?.(testValue, view)) {
                disabled = true;
            }
        }

        range.push({
            label,
            value: label,
            disabled,
        });
    }

    return range;
};

export const useTimeRanges = ({
    ampm = false,
    timeSteps = {},
    isTimeDisabled,
    minValue,
    maxValue,
    value,
}: UseTimeRangesProps) => {
    return React.useMemo(() => {
        const steps = {...DEFAULT_TIME_STEPS, ...timeSteps};
        const ranges: Record<string, WheelValue[]> = {};

        const hoursMax = ampm ? 12 : 23;
        const hoursStart = ampm ? 1 : 0;
        ranges.hours = generateRange(
            hoursStart,
            hoursMax,
            steps.hours,
            value,
            'hours',
            isTimeDisabled,
            minValue,
            maxValue,
        );

        ranges.minutes = generateRange(
            0,
            59,
            steps.minutes,
            value,
            'minutes',
            isTimeDisabled,
            minValue,
            maxValue,
        );

        ranges.seconds = generateRange(
            0,
            59,
            steps.seconds,
            value,
            'seconds',
            isTimeDisabled,
            minValue,
            maxValue,
        );

        if (ampm && value) {
            const amValue = value.hour() < 12 ? value : value.set('hour', value.hour() - 12);
            const pmValue = value.hour() >= 12 ? value : value.set('hour', value.hour() + 12);

            ranges.ampm = [
                {
                    label: 'AM',
                    value: 'AM',
                    disabled: !isWithinRange(amValue, minValue, maxValue),
                },
                {
                    label: 'PM',
                    value: 'PM',
                    disabled: !isWithinRange(pmValue, minValue, maxValue),
                },
            ];
        } else if (ampm) {
            ranges.ampm = [
                {label: 'AM', value: 'AM', disabled: false},
                {label: 'PM', value: 'PM', disabled: false},
            ];
        }

        return ranges;
    }, [ampm, timeSteps, isTimeDisabled, minValue, maxValue, value]);
};
