import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {block} from '../../../../utils/cn';
import {useViewportDimensions, useViewportInterval} from '../Ruler/Ruler';

import type {Geometry} from './utils';
import {calculatePosition, makeMiddleTicksGeometry, makeSlitTicksGeometry} from './utils';

import './Ticks.scss';

interface TicksProps {
    theme: 'normal' | 'dim';
    tickWidth: number;
    minValue?: DateTime;
    maxValue?: DateTime;

    geometry: Geometry;
    className?: string;
}

const b = block('timeline-ticks');

export {makeMiddleTicksGeometry, makeSlitTicksGeometry};
export type {Geometry};

export function UnavailableTicks({
    theme,
    geometry,
    tickWidth,
    minValue,
    maxValue,
    className,
}: TicksProps) {
    const viewport = useViewportDimensions();
    const interval = useViewportInterval();

    const endPoint = calculatePosition(minValue, interval, viewport.width);
    const startPoint = calculatePosition(maxValue, interval, viewport.width);

    const ticksGeometry = React.useMemo(() => {
        const tickCoords: number[] = [];
        if (!isNaN(endPoint) && endPoint > 0) {
            let x = endPoint - tickWidth;
            if (endPoint > viewport.width) {
                x = endPoint - tickWidth * Math.floor((endPoint - viewport.width) / tickWidth);
            }
            tickCoords.push(x);
            while (x > 0) {
                x -= tickWidth;
                tickCoords.push(x);
            }
        }

        if (!isNaN(startPoint) && startPoint < viewport.width) {
            let x = startPoint;
            if (startPoint < 0) {
                x = startPoint + tickWidth * Math.floor((0 - startPoint) / tickWidth) - tickWidth;
            }
            tickCoords.push(x);
            while (x < viewport.width) {
                x += tickWidth;
                tickCoords.push(x);
            }
        }
        return tickCoords.map(geometry).join('');
    }, [endPoint, geometry, startPoint, tickWidth, viewport.width]);

    const ticksPath = <path className={b({theme}, className)} d={ticksGeometry} />;

    return <React.Fragment>{ticksPath}</React.Fragment>;
}
