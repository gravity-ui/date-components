import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {block} from '../../../../utils/cn';
import type {RulerViewport} from '../../types';
import {Ticks, makeMiddleTicksGeometry, makeSlitTicksGeometry} from '../Ticks';

import {DEFAULT_MAX_VIEWPORT_LENGTH, DEFAULT_MIN_VIEWPORT_LENGTH} from './constants';
import {useNowLine, useViewportDragger, useViewportSize} from './hooks';

import './RulerViewport.scss';

export interface RenderSelectionOptions extends RulerViewport {
    viewportWidth: number;
    viewportHeight: number;
    viewportRef: React.RefObject<HTMLDivElement>;
}

interface ThinTimelineRulerProps extends RulerViewport {
    displayNow?: boolean;
    className?: string;
    viewportMinStart?: number;
    viewportMaxEnd?: number;
    viewportMinLength?: number;
    viewportMaxLength?: number;

    renderSelection?: (viewport: RenderSelectionOptions) => React.ReactNode;
    renderAdditionalSvg?: (viewport: RenderSelectionOptions) => React.ReactNode;
    formatTime?: (time: DateTime) => string;
    timeZone?: string;
    onUpdate?: (value: RulerViewport) => void;

    isTimelineDragEnabled?: boolean;
}

const b = block('thin-timeline-ruler-viewport');

export function ThinTimelineRulerViewport({
    viewportStart: originalViewportStart,
    viewportEnd: originalViewportEnd,
    viewportMinStart,
    viewportMaxEnd,
    onUpdate,
    displayNow,
    renderSelection,
    renderAdditionalSvg,
    formatTime,
    viewportMinLength = DEFAULT_MIN_VIEWPORT_LENGTH,
    viewportMaxLength = DEFAULT_MAX_VIEWPORT_LENGTH,
    isTimelineDragEnabled = true,
    timeZone,
}: ThinTimelineRulerProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const {viewportWidth, viewportHeight} = useViewportSize(containerRef);

    const {viewportStart, viewportEnd, onMouseDown} = useViewportDragger({
        viewportMinStart,
        viewportMaxEnd,
        viewportStart: originalViewportStart,
        viewportEnd: originalViewportEnd,
        viewportWidth,
        onViewportUpdate: onUpdate,
        viewportRef: containerRef,
        viewportMinLength: viewportMinLength,
        viewportMaxLength: viewportMaxLength,
    });

    const nowLineGeometry = useNowLine({
        viewportStart,
        viewportEnd,
        viewportWidth,
        viewportHeight,
        displayNow,
    });

    const primaryTicksGeometry = React.useMemo(
        () => makeSlitTicksGeometry({tickHeight: 4, viewportHeight}),
        [viewportHeight],
    );
    const secondaryTicksGeometry = React.useMemo(
        () => makeMiddleTicksGeometry({tickHeight: 4, viewportHeight}),
        [viewportHeight],
    );

    const selection = renderSelection
        ? renderSelection({
              viewportStart,
              viewportEnd,
              viewportWidth,
              viewportHeight,
              viewportRef: containerRef,
          })
        : null;

    return (
        <div ref={containerRef} className={b()}>
            <svg className={b('svg')} width="100%" height="100%">
                <defs>
                    {/* this one allows rendering background under tick labels */}
                    <filter x="0" y="0" width="1" height="1" id="yctt-ticklabelbg">
                        <feFlood floodColor="var(--g-color-base-background)" />
                        <feComposite in="SourceGraphic" />
                    </filter>
                </defs>
                <Ticks
                    minTickWidth={8}
                    maxTickWidth={20}
                    theme="dim"
                    geometry={secondaryTicksGeometry}
                    viewportStart={viewportStart}
                    viewportEnd={viewportEnd}
                    viewportWidth={viewportWidth}
                    timeZone={timeZone}
                />
                <Ticks
                    minTickWidth={80}
                    maxTickWidth={200}
                    theme="normal"
                    geometry={primaryTicksGeometry}
                    viewportStart={viewportStart}
                    viewportEnd={viewportEnd}
                    viewportWidth={viewportWidth}
                    hasLabels
                    formatTime={formatTime}
                    timeZone={timeZone}
                />
                {nowLineGeometry && <path d={nowLineGeometry} className={b('now')} />}
                {renderAdditionalSvg?.({
                    viewportStart,
                    viewportEnd,
                    viewportWidth,
                    viewportHeight,
                    viewportRef: containerRef,
                })}
            </svg>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            {isTimelineDragEnabled && <div className={b('dragger')} onMouseDown={onMouseDown} />}
            {selection}
        </div>
    );
}
