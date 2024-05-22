import React from 'react';

import type {RulerViewport} from '../../types';
import {rescaleSpan} from '../../utils/spans';
import type {Span} from '../../utils/spans';

interface UseTimeViewportOptions {
    start: number;
    end: number;
    /** Min ratio of viewport length by period length */
    minOverscaleRate: number;
}

function alignViewportToPeriod(period: Span) {
    // Selection должен занимать 25% всей шкалы
    const delta = (period.end - period.start) * 1.5;
    return {
        start: Math.round(period.start - delta),
        end: Math.round(period.end + delta),
    };
}

/**
 * Manages viewport state and adjusts is for selected period if needed.
 * @param options Hook options
 * @returns Viewport state and state updater
 */
export default function useTimeViewport({start, end, minOverscaleRate}: UseTimeViewportOptions) {
    const [localViewPort, setLocalViewport] = React.useState<Span | undefined>(() =>
        rescaleSpan({
            start,
            end,
            scale: minOverscaleRate,
        }),
    );

    const onViewportUpdate = React.useCallback(({viewportStart, viewportEnd}: RulerViewport) => {
        const newViewport = {start: Math.round(viewportStart), end: Math.round(viewportEnd)};
        setLocalViewport(newViewport);
    }, []);

    React.useEffect(() => {
        // если поменялся период, то сбрасываем локальное, установленное ранее через onViewportUpdate, значение
        setLocalViewport(undefined);
    }, [start, end]);
    // Используем useMemo так как если поменялся период, то значение надо сразу рассчитывать.
    // Если делать через setLocalViewport, получается эффект мигания, когда selection отрисовывается со старыми значениями, а потом с новыми
    const viewport = React.useMemo(() => alignViewportToPeriod({start, end}), [start, end]);

    return {
        viewportStart: localViewPort === undefined ? viewport.start : localViewPort.start,
        viewportEnd: localViewPort === undefined ? viewport.end : localViewPort.end,
        onViewportUpdate,
    };
}
