'use client';

import React from 'react';

import {useMove} from '../../../../hooks/useMove';
import type {MoveEndEvent, MoveMoveEvent, MoveStartEvent} from '../../../../hooks/useMove';
import {block} from '../../../../utils/cn';

import './RulerViewport.scss';

const b = block('ruler-viewport');

interface RulerViewportProps {
    className?: string;
    children?: React.ReactNode;
    onMoveStart?: (event: MoveStartEvent) => void;
    onMove?: (delta: number, event: MoveMoveEvent) => void;
    onMoveEnd?: (event: MoveEndEvent) => void;
    dragDisabled?: boolean;
}

function RulerViewport(
    {className, children, onMove, onMoveStart, onMoveEnd, dragDisabled}: RulerViewportProps,
    ref: React.Ref<HTMLDivElement>,
) {
    const containerRef = React.useRef<SVGSVGElement>(null);
    const draggable = typeof onMove === 'function';
    const {moveProps} = useMove({
        onMoveStart: onMoveStart,
        onMove: (e) => {
            const container = containerRef.current;
            if (e.deltaX !== 0 && container) {
                const {width} = container.getBoundingClientRect();
                let delta = (e.deltaX * 100) / width;
                delta = Math.round(delta * 100) / 100;
                if (delta !== 0) {
                    onMove?.(delta, e);
                }
            }
        },
        onMoveEnd: onMoveEnd,
    });

    return (
        <div ref={ref} className={b(null, className)}>
            <svg
                ref={containerRef}
                className={b('svg')}
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <defs>
                    {/* this one allows rendering background under tick labels */}
                    <filter x="0" y="0" width="1" height="1" id="g-date-tt-ticklabelbg">
                        <feFlood floodColor="var(--_--g-date-ruler-viewport-background)" />
                        <feComposite in="SourceGraphic" />
                    </filter>
                </defs>
                {children}
            </svg>
            {draggable ? (
                <div className={b('dragger', {disabled: dragDisabled})} {...moveProps} />
            ) : null}
        </div>
    );
}

const _RulerViewport = React.forwardRef(RulerViewport);
export {_RulerViewport as RulerViewport};
