import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {block} from '../../../../utils/cn';
import type {RulerViewport} from '../../types';
import {getLerpCoeff} from '../../utils/spans';

import type {Geometry} from './geometry';
import {calculateTickTimes, formatTick as defaultFormatTime} from './tickSizes';

import './Ticks.scss';

interface TicksProps extends RulerViewport {
    viewportWidth: number;
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

const b = block('thin-timeline-ruler-ticks');

export function Ticks({
    theme,
    viewportStart,
    viewportEnd,
    viewportWidth,
    minTickWidth,
    maxTickWidth,
    hasLabels,
    geometry,
    className,
    labelsClassName,
    formatTime,
    timeZone,
}: TicksProps) {
    const tickTimes = React.useMemo(
        () =>
            calculateTickTimes({
                minTickWidth,
                maxTickWidth,
                viewportStart,
                viewportEnd,
                viewportWidth,
                timeZone,
            }),
        [maxTickWidth, minTickWidth, viewportEnd, viewportStart, viewportWidth, timeZone],
    );
    const tickCoords = React.useMemo(() => {
        const timeToXCoeff = getLerpCoeff(
            {start: viewportStart, end: viewportEnd},
            {start: 0, end: viewportWidth},
        );
        return tickTimes.map((t) => 0 + Math.round((t.valueOf() - viewportStart) * timeToXCoeff));
    }, [tickTimes, viewportEnd, viewportStart, viewportWidth]);

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
                    filter="url(#yctt-ticklabelbg)"
                >
                    {formatTime ? formatTime(dt) : defaultFormatTime(dt)}
                </text>,
            );
        }
        return result;
    }, [hasLabels, tickCoords, tickTimes, labelsClassName, timeZone]);

    if (tickLabels) {
        return (
            <React.Fragment>
                {ticksPath}
                {tickLabels}
            </React.Fragment>
        );
    }

    return ticksPath;
}
