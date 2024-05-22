import React from 'react';

import {block} from '../../../../utils/cn';

import './HandleTooltip.scss';

const b = block('thin-timeline-ruler-handle-tooltip');

interface TooltipProps {
    tooltipRef: React.RefObject<HTMLDivElement>;
    active: boolean;
    isEdge: boolean;
    horizontalPosition: 'left' | 'right';
    tooltipOverflowPosition: 'top' | 'bottom';
    actualPeriod: number;
    renderHandleTooltip: (ms: number) => React.ReactNode;
}

export function HandleTooltip({
    tooltipRef,
    active,
    isEdge,
    horizontalPosition,
    tooltipOverflowPosition,
    actualPeriod,
    renderHandleTooltip,
}: TooltipProps) {
    return (
        <div
            ref={tooltipRef}
            className={b({
                active: active,
                right: horizontalPosition === 'right' && !isEdge,
                left: horizontalPosition === 'left' && !isEdge,
                'top-end':
                    tooltipOverflowPosition === 'top' && horizontalPosition === 'right' && isEdge,
                'bottom-end':
                    tooltipOverflowPosition === 'bottom' &&
                    horizontalPosition === 'right' &&
                    isEdge,
                'top-start':
                    tooltipOverflowPosition === 'top' && horizontalPosition === 'left' && isEdge,
                'bottom-start':
                    tooltipOverflowPosition === 'bottom' && horizontalPosition === 'left' && isEdge,
            })}
        >
            {renderHandleTooltip(actualPeriod)}
        </div>
    );
}
