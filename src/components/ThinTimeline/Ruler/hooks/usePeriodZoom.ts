import React from 'react';

import type {Period} from '../../types';
import {clamp} from '../../utils/clamp';
import {rescaleSpan} from '../../utils/spans';
import type {Span} from '../../utils/spans';

interface UseViewportZoomOptions {
    period: Span;
    coeff: number;
    pointOfMaxInterest: number;
    onUpdate: (value: Period) => void;
    minPeriodLength: number;
    maxPeriodLength: number;
}

/**
 * Creates a callback that will scale selected period with given `coeff`.
 * `pointOfMaxInterest` is a fixed point.
 * @param options Hook options
 * @returns onZoom callback to attach to some button
 */
export default function usePeriodZoom({
    period,
    coeff,
    pointOfMaxInterest,
    onUpdate,
    minPeriodLength,
    maxPeriodLength,
}: UseViewportZoomOptions) {
    return React.useCallback(() => {
        const periodLength = period.end - period.start;
        const maxScaleCoeff = maxPeriodLength / periodLength;
        const minScaleCoeff = minPeriodLength / periodLength;
        const scaled = rescaleSpan({
            ...period,
            scale: clamp(coeff, minScaleCoeff, maxScaleCoeff),
            fixedPoint: pointOfMaxInterest,
        });
        onUpdate({start: scaled.start, end: scaled.end});
    }, [coeff, maxPeriodLength, minPeriodLength, onUpdate, period, pointOfMaxInterest]);
}
