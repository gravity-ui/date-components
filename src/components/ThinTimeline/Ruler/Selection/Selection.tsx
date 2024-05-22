import React from 'react';

import {Label, spacing} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import type {HasHandlesProp, Period, RulerConfiguration} from '../../types';
import {clamp} from '../../utils/clamp';
import {HandleTooltip} from '../HandleTooltip/HandleTooltip';
import {useSimpleDrag} from '../hooks';
import type {DragData} from '../hooks';

import './Selection.scss';

interface SelectionProps extends RulerConfiguration, HasHandlesProp {
    /** Width available for viewport drawing (px) */
    viewportWidth: number;
    /** Gets invoked whenever selection is dragged around by user */
    onUpdate?: (value: Period) => void;
    viewportRef?: React.RefObject<HTMLDivElement>;
    showTooltip?: Boolean;
    renderLeftHandleTooltip?: (actualPeriodStart: number) => React.ReactNode;
    renderRightHandleTooltip?: (actualPeriodEnd: number) => React.ReactNode;
    tooltipOverflowPosition?: 'top' | 'bottom';
    /** Wrapping div additional className */
    className?: string;
}

const b = block('thin-timeline-ruler-selection');
const MIN_SELECTION_WIDTH = 12; // px

interface DragInfo {
    isStartMoving: boolean;
    isEndMoving: boolean;
    periodStart: number;
    periodEnd: number;
    viewportStart: number;
    viewportEnd: number;
    viewportWidth: number;
    xToTimeCoeff: number;
}

export function Selection({
    start: periodStart,
    end: periodEnd,
    viewportStart,
    viewportEnd,
    viewportWidth,
    viewportRef,
    onUpdate,
    showTooltip,
    renderLeftHandleTooltip = DefaultLeftHandleTooltip,
    renderRightHandleTooltip = DefaultRightHandleTooltip,
    tooltipOverflowPosition = 'top',
    className,
    hasHandles = true,
}: SelectionProps) {
    const isInteractive = Boolean(onUpdate);

    const [tempPeriodStart, setTempPeriodStart] = React.useState<number | undefined>(undefined);
    const [tempPeriodEnd, setTempPeriodEnd] = React.useState<number | undefined>(undefined);

    const [isLeftTooltipStartPos, setIsLeftTooltipStartPos] = React.useState<boolean>(false);
    const [isRightTooltipEndPos, setIsRightTooltipEndPos] = React.useState<boolean>(false);

    const [leftEdge, setLeftEdge] = React.useState<number>(0);
    const [rightEdge, setRightEdge] = React.useState<number>(window.innerWidth);

    const [isTooltipActive, setIsTooltipActive] = React.useState<boolean>(false);

    const leftTooltipRef = React.useRef<HTMLDivElement>(null);
    const rightTooltipRef = React.useRef<HTMLDivElement>(null);
    const leftHandleRef = React.useRef<HTMLDivElement>(null);
    const rightHandleRef = React.useRef<HTMLDivElement>(null);

    const actualPeriodStart = tempPeriodStart ?? periodStart;
    const actualPeriodEnd = tempPeriodEnd ?? periodEnd;

    const selectionStyle = React.useMemo(() => {
        const start = (actualPeriodStart - viewportStart) / (viewportEnd - viewportStart);
        const length = (actualPeriodEnd - actualPeriodStart) / (viewportEnd - viewportStart);

        const left = clamp(start, 0, 1);
        const width = clamp(length, 0, 1 - left);

        return {
            left: left * 100 + '%',
            width: width * 100 + '%',
        };
    }, [actualPeriodEnd, actualPeriodStart, viewportEnd, viewportStart]);

    const dragInfo = React.useRef<DragInfo>({
        isStartMoving: false,
        isEndMoving: false,
        viewportStart,
        viewportEnd,
        viewportWidth,
        periodStart,
        periodEnd,
        xToTimeCoeff: 1,
    });

    React.useEffect(() => {
        const timelineSize = viewportRef?.current?.getBoundingClientRect();

        if (timelineSize !== undefined) {
            setLeftEdge(timelineSize.left);
            setRightEdge(timelineSize.right);
        }
        // this needs if user resize page
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewportRef?.current?.getBoundingClientRect()]);

    const onDragLeftHandle = React.useCallback(() => {
        const leftHandleRect = leftHandleRef.current?.getBoundingClientRect();
        if (leftHandleRect && leftTooltipRef.current) {
            if (leftHandleRect.left - leftTooltipRef.current?.clientWidth < leftEdge) {
                setIsLeftTooltipStartPos(true);
            } else {
                setIsLeftTooltipStartPos(false);
            }
        }
    }, [leftEdge]);

    const onDragRightHandle = React.useCallback(() => {
        const rightHandleRect = rightHandleRef.current?.getBoundingClientRect();
        if (rightHandleRect && rightTooltipRef.current) {
            if (rightHandleRect.right + rightTooltipRef.current?.clientWidth > rightEdge) {
                setIsRightTooltipEndPos(true);
            } else {
                setIsRightTooltipEndPos(false);
            }
        }
    }, [rightEdge]);

    const onInit = React.useCallback(
        (ev: React.MouseEvent) => {
            const info = dragInfo.current;

            setIsTooltipActive(true);
            onDragLeftHandle();
            onDragRightHandle();

            info.isStartMoving = Boolean(ev.currentTarget.getAttribute('data-start'));
            info.isEndMoving = Boolean(ev.currentTarget.getAttribute('data-end'));
            // warning: this sets all the values in stone for the dragging process
            // until it eventually ends. resizing the page while dragging gonna break
            info.xToTimeCoeff = (viewportEnd - viewportStart) / viewportWidth;
            info.periodStart = periodStart;
            info.periodEnd = periodEnd;
            info.viewportStart = viewportStart;
            info.viewportEnd = viewportEnd;
            info.viewportWidth = viewportWidth;
        },
        [
            onDragLeftHandle,
            onDragRightHandle,
            periodEnd,
            periodStart,
            viewportEnd,
            viewportStart,
            viewportWidth,
        ],
    );

    const onDrag = React.useCallback(
        ({dx}: DragData) => {
            const info = dragInfo.current;
            const shifted = shiftSelection(info, dx);

            onDragLeftHandle();
            onDragRightHandle();

            if (info.isStartMoving) {
                setTempPeriodStart(shifted.start);
            }
            if (info.isEndMoving) {
                setTempPeriodEnd(shifted.end);
            }
        },
        [onDragLeftHandle, onDragRightHandle],
    );
    const onDrop = React.useCallback(
        ({dx}: DragData) => {
            const info = dragInfo.current;

            setIsTooltipActive(false);

            const newPeriod = shiftSelection(info, dx);
            if (info.isStartMoving) {
                setTempPeriodStart(undefined);
            }
            if (info.isEndMoving) {
                setTempPeriodEnd(undefined);
            }

            newPeriod.start = Math.round(newPeriod.start);

            newPeriod.end = Math.round(newPeriod.end);

            info.isStartMoving = false;
            info.isEndMoving = false;

            // no drag listeners will be attached if onUpdate is not provided
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            onUpdate!(newPeriod);
        },
        [onUpdate],
    );

    const onMouseUpPreparing = React.useCallback(() => {
        const info = dragInfo.current;

        info.isStartMoving = false;
        info.isEndMoving = false;
        setIsTooltipActive(false);
    }, []);

    const handleMouseDown = useSimpleDrag({
        onInit,
        onDrag,
        onDrop,
        onMouseUpPreparing,
    });

    return (
        <div className={b(null, className)} style={selectionStyle}>
            {hasHandles && (
                <React.Fragment>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                        className={b('handle', {left: true, enabled: isInteractive})}
                        data-start
                        onMouseDown={handleMouseDown}
                        ref={leftHandleRef}
                    >
                        {showTooltip && (
                            <HandleTooltip
                                tooltipRef={leftTooltipRef}
                                active={dragInfo.current.isStartMoving && isTooltipActive}
                                horizontalPosition="left"
                                tooltipOverflowPosition={tooltipOverflowPosition}
                                isEdge={isLeftTooltipStartPos}
                                actualPeriod={actualPeriodStart}
                                renderHandleTooltip={renderLeftHandleTooltip}
                            />
                        )}
                    </div>

                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                        className={b('handle', {right: true, enabled: isInteractive})}
                        data-end
                        onMouseDown={handleMouseDown}
                        ref={rightHandleRef}
                    >
                        {showTooltip && (
                            <HandleTooltip
                                tooltipRef={rightTooltipRef}
                                active={dragInfo.current.isEndMoving && isTooltipActive}
                                horizontalPosition="right"
                                tooltipOverflowPosition={tooltipOverflowPosition}
                                isEdge={isRightTooltipEndPos}
                                actualPeriod={actualPeriodEnd}
                                renderHandleTooltip={renderRightHandleTooltip}
                            />
                        )}
                    </div>
                </React.Fragment>
            )}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
                className={b('interactive', {enabled: isInteractive, bordered: !hasHandles})}
                data-start
                data-end
                onMouseDown={handleMouseDown}
            />
        </div>
    );
}

function shiftSelection(info: DragInfo, dx: number): Period {
    const timeShift = dx * info.xToTimeCoeff;

    if (info.isStartMoving && info.isEndMoving) {
        let newStart = info.periodStart + timeShift;
        let newEnd = info.periodEnd + timeShift;
        if (newStart < info.viewportStart) {
            newStart = info.viewportStart;
            newEnd = info.viewportStart + info.periodEnd - info.periodStart;
        } else if (newEnd > info.viewportEnd) {
            newStart = info.viewportEnd - (info.periodEnd - info.periodStart);
            newEnd = info.viewportEnd;
        }

        return {
            start: newStart,
            end: newEnd,
        };
    }

    const minSelectionDuration = MIN_SELECTION_WIDTH * info.xToTimeCoeff;

    if (info.isStartMoving) {
        return {
            start: clamp(
                info.periodStart + timeShift,
                info.viewportStart,
                info.periodEnd - minSelectionDuration,
            ),
            end: info.periodEnd,
        };
    }
    if (info.isEndMoving) {
        return {
            start: info.periodStart,
            end: clamp(
                info.periodEnd + timeShift,
                info.periodStart + minSelectionDuration,
                info.viewportEnd,
            ),
        };
    }

    return {start: info.periodStart, end: info.periodEnd};
}

function dateFormatter(ms: number) {
    const date = new Date(ms);
    return date.toLocaleString('ru', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
}

function DefaultLeftHandleTooltip(actualPeriodStart: number) {
    return (
        <Label theme="clear" className={b('tooltip-label', spacing({mr: 1}))}>
            {dateFormatter(actualPeriodStart)}
        </Label>
    );
}

function DefaultRightHandleTooltip(actualPeriodEnd: number) {
    return (
        <Label theme="clear" className={b('tooltip-label', spacing({ml: 1}))}>
            {dateFormatter(actualPeriodEnd)}
        </Label>
    );
}
