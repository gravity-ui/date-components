import React from 'react';

import {guessUserTimeZone} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {useReferentiallyConstantObject} from '../hooks/useReferentiallyConstantObject';
import type {HasHandlesProp, Period} from '../types';

import {ControlledThinTimelineRuler} from './ControlledRuler/ControlledRuler';
import type {RenderSelectionOptions} from './RulerViewport/RulerViewport';
import {DEFAULT_MAX_VIEWPORT_LENGTH, DEFAULT_MIN_VIEWPORT_LENGTH} from './RulerViewport/constants';
import usePeriodZoom from './hooks/usePeriodZoom';
import useTimeViewport from './hooks/useTimeViewport';

export interface UncontrolledThinTimelineRulerProps extends Period, HasHandlesProp {
    /** Gets invoked whenever selected period gets updated */
    onUpdate?: (value: Period) => void;
    /** If display red line denoting current instant */
    displayNow?: boolean;
    /** If render '-' and '+' buttons */
    hasZoomButtons?: boolean;
    /** Position of the '-' and '+' zoom buttons */
    zoomButtonsPosition?: 'left' | 'right';
    /** Use this to customize rendering of selected period */
    renderSelection?: (opts: RenderSelectionOptions) => React.ReactNode;
    /** Use this to render additional SVG nodes on the ruler */
    renderAdditionalSvg?: (opts: RenderSelectionOptions) => React.ReactNode;
    /** Use this to allow custom rendering of time ticks */
    formatTime?: (time: DateTime) => string;

    /**
     * This prop can be used to specify the point of maximal interest in the
     * selected period. 0 means the earliest point, 1 means the latest, 0.5 can
     * be used to mark the middle of the selected period.
     *
     * When zoom buttons are pressed, this point in the selected period will
     * remain fixed.
     */
    pointOfMaxInterest?: number;

    /** Min ruler viewport length (ms, default is 1m) */
    viewportMinLength?: number;
    /** Max ruler viewport length (ms, default is 20y) */
    viewportMaxLength?: number;

    /** Fixed ruler viewport start point (ms) */
    viewportStart?: number;
    /** Fixed ruler viewport end point (ms) */
    viewportEnd?: number;

    /** If disabled, prevents timeline drag. Default: true */
    isTimelineDragEnabled?: boolean;

    /**
     * Specify this if you want to override the timeZone used when parsing or formatting a date and time value.
     * If no timeZone is set, the default timeZone for the current user is used.
     */
    timeZone?: string;

    className?: string;
}

const MAX_OVERSCALE_RATE = 10;
const MIN_OVERSCALE_RATE = 6;
const ZOOM_IN_COEFF = 1.5;
const ZOOM_OUT_COEFF = 0.5;

export const UncontrolledThinTimelineRuler = ({
    start,
    end,
    onUpdate,
    displayNow,
    hasZoomButtons,
    zoomButtonsPosition = 'left',
    renderSelection,
    renderAdditionalSvg,
    formatTime,
    pointOfMaxInterest = 1,
    viewportMinLength = DEFAULT_MIN_VIEWPORT_LENGTH,
    viewportMaxLength = DEFAULT_MAX_VIEWPORT_LENGTH,
    viewportStart: fixedViewportStart,
    viewportEnd: fixedViewPortEnd,
    hasHandles = true,
    isTimelineDragEnabled = true,
    timeZone = guessUserTimeZone(),
    className = '',
}: UncontrolledThinTimelineRulerProps) => {
    const period = useReferentiallyConstantObject({start, end});
    const {viewportStart, viewportEnd, onViewportUpdate} = useTimeViewport({
        start,
        end,
        minOverscaleRate: MIN_OVERSCALE_RATE,
    });

    const actualViewportStart = fixedViewportStart || viewportStart;
    const actualViewportEnd = fixedViewPortEnd || viewportEnd;

    const {minPeriodLength, maxPeriodLength} = React.useMemo(
        () => ({
            minPeriodLength: viewportMinLength / MAX_OVERSCALE_RATE,
            maxPeriodLength: viewportMaxLength / MIN_OVERSCALE_RATE,
        }),
        [viewportMaxLength, viewportMinLength],
    );

    const onZoomIn = usePeriodZoom({
        period,
        coeff: ZOOM_IN_COEFF,
        pointOfMaxInterest,
        onUpdate: onUpdate ?? function () {},
        minPeriodLength,
        maxPeriodLength,
    });
    const onZoomOut = usePeriodZoom({
        period,
        coeff: ZOOM_OUT_COEFF,
        pointOfMaxInterest,
        onUpdate: onUpdate ?? function () {},
        minPeriodLength,
        maxPeriodLength,
    });
    return (
        <ControlledThinTimelineRuler
            className={className}
            timeZone={timeZone}
            start={start}
            end={end}
            onUpdate={onUpdate}
            viewportStart={actualViewportStart}
            viewportEnd={actualViewportEnd}
            onViewportUpdate={onViewportUpdate}
            onZoomIn={hasZoomButtons ? onZoomIn : undefined}
            onZoomOut={hasZoomButtons ? onZoomOut : undefined}
            zoomButtonsPosition={zoomButtonsPosition}
            displayNow={displayNow}
            renderSelection={renderSelection}
            renderAdditionalSvg={renderAdditionalSvg}
            formatTime={formatTime}
            viewportMinLength={viewportMinLength}
            viewportMaxLength={viewportMaxLength}
            hasHandles={hasHandles}
            isTimelineDragEnabled={isTimelineDragEnabled}
        />
    );
};
