import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {dateTime} from '@gravity-ui/date-utils';

import {block} from '../../../../utils/cn';
import {getLerpCoeff} from '../../utils/span';
import {useViewportDimensions, useViewportInterval} from '../Ruler/Ruler';

import type {Geometry} from './utils';
import {
    calculateTickTimes,
    formatTick as defaultFormatTime,
    makeMiddleTicksGeometry,
    makeSlitTicksGeometry,
} from './utils';

import './Ticks.scss';

interface TicksProps {
    theme: 'normal' | 'dim';
    minTickWidth: number;
    maxTickWidth: number;
    hasLabels?: boolean;

    geometry: Geometry;
    className?: string;
    labelsClassName?: string;

    formatTime?: (time: DateTime) => string;
    timeZone?: string;
}

const b = block('timeline-ticks');

export {makeMiddleTicksGeometry, makeSlitTicksGeometry};

export function Ticks({
    theme,
    minTickWidth,
    maxTickWidth,
    hasLabels,
    geometry,
    className,
    labelsClassName,
    formatTime,
    timeZone,
}: TicksProps) {
    const viewport = useViewportDimensions();
    const interval = useViewportInterval();
    const tickTimes = React.useMemo(
        () =>
            calculateTickTimes({
                minTickWidth,
                maxTickWidth,
                viewportStart: interval.start,
                viewportEnd: interval.end,
                viewportWidth: viewport.width,
                timeZone,
            }),
        [maxTickWidth, minTickWidth, interval, viewport.width, timeZone],
    );
    const tickCoords = React.useMemo(() => {
        const timeToXCoeff = getLerpCoeff(
            {start: interval.start.valueOf(), end: interval.end.valueOf()},
            {start: 0, end: viewport.width},
        );
        return tickTimes.map(
            (t) => 0 + Math.round((t.valueOf() - interval.start.valueOf()) * timeToXCoeff),
        );
    }, [tickTimes, interval, viewport.width]);

    const ticksGeometry = React.useMemo(() => {
        return tickCoords.map(geometry).join('');
    }, [geometry, tickCoords]);

    const ticksPath = <path className={b({theme}, className)} d={ticksGeometry} />;

    const tickLabels = React.useMemo(() => {
        if (!hasLabels || tickCoords.length < 2) {
            return null;
        }

        const result: React.ReactElement[] = [];

        for (let i = 0; i < tickCoords.length; i++) {
            const x = tickCoords[i];
            const t = tickTimes[i];
            const dt = dateTime({input: t, timeZone});

            result.push(
                <text
                    key={i}
                    className={b('label', labelsClassName)}
                    dominantBaseline="middle"
                    x={x}
                    y="50%"
                    filter="url(#g-date-tt-ticklabelbg)"
                >
                    {formatTime ? formatTime(dt) : defaultFormatTime(dt)}
                </text>,
            );
        }
        return result;
    }, [hasLabels, tickCoords, tickTimes, timeZone, labelsClassName, formatTime]);

    return (
        <React.Fragment>
            {ticksPath}
            {tickLabels}
        </React.Fragment>
    );
}
