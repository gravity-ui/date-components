import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import ReactDOM from 'react-dom';

import type {MoveEndEvent, MoveMoveEvent, MoveStartEvent} from '../../../../hooks/useMove';
import {useResizeObserver} from '../../../../hooks/useResizeObserver';
import {block} from '../../../../utils/cn';
import type {RangeValue} from '../../../types';
import {NowLine} from '../NowLine/NowLine';
import {RulerViewport} from '../RulerViewport/RulerViewport';
import {MiddleTicks} from '../Ticks/MiddleTicks';
import {SlitTicks} from '../Ticks/SlitTicks';
import {UnavailableTicks} from '../Ticks/UnavialableTicks';
import {makeUnavailableTicksGeometry} from '../Ticks/utils';

const b = block('ruler');

interface RulerProps {
    className?: string;
    children?: React.ReactNode;
    start: DateTime;
    end: DateTime;
    minValue?: DateTime;
    maxValue?: DateTime;
    onMoveStart?: (event: MoveStartEvent) => void;
    onMove?: (delta: number, event: MoveMoveEvent) => void;
    onMoveEnd?: (event: MoveEndEvent) => void;
    displayNow?: boolean;
    formatTime?: (time: DateTime) => string;
    timeZone?: string;
    dragDisabled?: boolean;
}

interface ViewportDimensions {
    width: number;
    height: number;
}

type ViewportInterval = RangeValue<DateTime>;

const viewportDimensionsContext = React.createContext<ViewportDimensions | null>(null);
const viewportIntervalContext = React.createContext<ViewportInterval | null>(null);

export function DateTimeRuler({
    className,
    children,
    start,
    end,
    minValue,
    maxValue,
    onMove,
    onMoveStart,
    onMoveEnd,
    displayNow,
    formatTime,
    timeZone,
    dragDisabled,
}: RulerProps) {
    const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
    const viewportInterval = React.useMemo(() => ({start, end}), [start, end]);
    const [viewportDimensions, setViewportDimensions] = React.useState<ViewportDimensions>({
        width: 0,
        height: 0,
    });
    const onResize = React.useCallback(() => {
        if (!container) {
            return;
        }
        const {width, height} = container.getBoundingClientRect();
        setViewportDimensions({width, height});
    }, [container]);

    const containerRef = React.useMemo(() => ({current: container}), [container]);

    useResizeObserver({ref: containerRef, onResize});

    const hasConstrains = Boolean(minValue || maxValue);

    return (
        <div className={b(null, className)}>
            <viewportIntervalContext.Provider value={viewportInterval}>
                <viewportDimensionsContext.Provider value={viewportDimensions}>
                    <RulerViewport
                        ref={setContainer}
                        onMove={onMove}
                        onMoveStart={onMoveStart}
                        onMoveEnd={onMoveEnd}
                        dragDisabled={dragDisabled}
                    >
                        <MiddleTicks timeZone={timeZone} />
                        <SlitTicks formatTime={formatTime} timeZone={timeZone} />
                        {hasConstrains ? (
                            <UnavailableTicks
                                theme="dim"
                                minValue={minValue}
                                maxValue={maxValue}
                                geometry={makeUnavailableTicksGeometry({
                                    tickHeight: 10,
                                    viewportHeight: viewportDimensions.height,
                                })}
                                tickWidth={viewportDimensions.height + 10}
                            />
                        ) : null}
                        {displayNow ? <NowLine /> : null}
                    </RulerViewport>
                    {container ? ReactDOM.createPortal(children, container) : null}
                </viewportDimensionsContext.Provider>
            </viewportIntervalContext.Provider>
        </div>
    );
}

export function useViewportDimensions() {
    const viewport = React.useContext(viewportDimensionsContext);
    if (!viewport) {
        throw new Error('useViewportDimensions must be used within a RulerViewport');
    }
    return viewport;
}

export function useViewportInterval() {
    const viewport = React.useContext(viewportIntervalContext);
    if (!viewport) {
        throw new Error('useViewportInterval must be used within a RulerViewport');
    }
    return viewport;
}
