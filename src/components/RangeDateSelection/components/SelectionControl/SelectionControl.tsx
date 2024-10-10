import React from 'react';

import {useMove} from '../../../../hooks/useMove';
import {block} from '../../../../utils/cn';
import type {AccessibilityProps, DomProps, StyleProps} from '../../../types';
import type {RangeDateSelectionState} from '../../hooks/useRangeDateSelectionState';
import {i18n} from '../../i18n';
import {lerp} from '../../utils/span';
import {useViewportDimensions, useViewportInterval} from '../Ruler/Ruler';

import './SelectionControl.scss';

const b = block('range-date-selection-control');

const MIN_SELECTION_WIDTH = 12; // px;
const MIN_DRAG_SCALE = 0.01;
const MAX_DRAG_SCALE = 100;
const DRAG_SCALE_STRENGTH = 20;

interface SelectionControlProps extends DomProps, StyleProps, AccessibilityProps {
    state: RangeDateSelectionState;
}

export function SelectionControl({state, style, className, ...props}: SelectionControlProps) {
    const {start: startDate, end: endDate} = useViewportInterval();
    const viewport = useViewportDimensions();

    const [isDragging, setIsDragging] = React.useState<'dragger' | 'start' | 'end' | null>(null);

    const moveDataRef = React.useRef<{isZooming: boolean}>({
        isZooming: false,
    });

    const visualMinDuration =
        (MIN_SELECTION_WIDTH * (endDate.valueOf() - startDate.valueOf())) / viewport.width;

    const handleMoveEnd = () => {
        state.endDragging();
        setIsDragging(null);
    };

    const {moveProps} = useMove({
        onMoveStart: (e) => {
            setIsDragging('dragger');
            state.startDragging();
            moveDataRef.current = {
                isZooming: state.canResize && (e.ctrlKey || e.metaKey),
            };
        },
        onMoveEnd: handleMoveEnd,
        onMove: (e) => {
            if (e.deltaX === 0) {
                return;
            }
            if (moveDataRef.current.isZooming) {
                let scale = Math.exp((e.deltaX * DRAG_SCALE_STRENGTH) / viewport.width);
                scale = Math.min(Math.max(scale, MIN_DRAG_SCALE), MAX_DRAG_SCALE);
                state.scale(scale, {visualMinDuration});
            } else {
                let delta = (e.deltaX * (endDate.valueOf() - startDate.valueOf())) / viewport.width;
                if (e.pointerType === 'keyboard') {
                    delta =
                        delta > 0
                            ? Math.max(delta, state.align)
                            : Math.min(delta, -1 * state.align);
                }
                state.move(delta, {visualMinDuration});
            }
        },
    });
    const {moveProps: moveStartProps} = useMove({
        onMoveStart: () => {
            setIsDragging('start');
            state.startDragging();
        },
        onMoveEnd: handleMoveEnd,
        onMove: (e) => {
            if (e.deltaX === 0) {
                return;
            }
            let delta = (e.deltaX * (endDate.valueOf() - startDate.valueOf())) / viewport.width;
            if (e.pointerType === 'keyboard') {
                delta =
                    delta > 0 ? Math.max(delta, state.align) : Math.min(delta, -1 * state.align);
            }
            state.moveStart(delta, {visualMinDuration});
        },
    });
    const {moveProps: moveEndProps} = useMove({
        onMoveStart: () => {
            setIsDragging('end');
            state.startDragging();
        },
        onMoveEnd: handleMoveEnd,
        onMove: (e) => {
            if (e.deltaX === 0) {
                return;
            }
            let delta = (e.deltaX * (endDate.valueOf() - startDate.valueOf())) / viewport.width;
            if (e.pointerType === 'keyboard') {
                delta =
                    delta > 0 ? Math.max(delta, state.align) : Math.min(delta, -1 * state.align);
            }
            state.moveEnd(delta, {visualMinDuration});
        },
    });

    const {start: startValue, end: endValue} = state.value;
    const startX = lerp(
        {start: startDate.valueOf(), end: endDate.valueOf()},
        {start: 0, end: viewport.width},
        startValue.valueOf(),
    );
    const endX = lerp(
        {start: startDate.valueOf(), end: endDate.valueOf()},
        {start: 0, end: viewport.width},
        endValue.valueOf(),
    );

    const draggerInputRef = React.useRef<HTMLInputElement>(null);
    const startInputRef = React.useRef<HTMLInputElement>(null);
    const endInputRef = React.useRef<HTMLInputElement>(null);

    let id = React.useId();
    id = props.id ?? id;

    return (
        <div className={b(null, className)} style={{...style, left: startX, width: endX - startX}}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
                className={b('dragger', {
                    dragging: isDragging === 'dragger',
                    disabled: Boolean(isDragging && isDragging !== 'dragger'),
                })}
                {...moveProps}
                onClick={() => {
                    draggerInputRef.current?.focus();
                }}
            >
                <div className={b('slider-input-wrapper')}>
                    <input
                        id={`${id}-range`}
                        ref={draggerInputRef}
                        className={b('slider-input')}
                        type="range"
                        step={1}
                        aria-label={i18n('Range')}
                        aria-labelledby={[`${id}-range`, props['aria-labelledby']]
                            .filter(Boolean)
                            .join(' ')}
                        aria-orientation="horizontal"
                        aria-valuetext={`${startValue.format()} - ${endValue.format()}`}
                        value={0}
                        onChange={() => {}}
                    />
                </div>
            </div>
            {state.canResize ? (
                /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
                <div
                    className={b('start', {
                        dragging: isDragging === 'start',
                        disabled: Boolean(isDragging && isDragging !== 'start'),
                    })}
                    {...moveStartProps}
                    onClick={() => {
                        startInputRef.current?.focus();
                    }}
                >
                    <div className={b('slider-input-wrapper')}>
                        <input
                            id={`${id}-start`}
                            ref={startInputRef}
                            className={b('slider-input')}
                            type="range"
                            step={1}
                            aria-label={i18n('Start of range')}
                            aria-labelledby={[`${id}-start`, props['aria-labelledby']]
                                .filter(Boolean)
                                .join(' ')}
                            aria-orientation="horizontal"
                            aria-valuetext={`${startValue.format()}`}
                            value={0}
                            onChange={() => {}}
                        />
                    </div>
                </div>
            ) : null}
            {state.canResize ? (
                /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
                <div
                    className={b('end', {
                        dragging: isDragging === 'end',
                        disabled: Boolean(isDragging && isDragging !== 'end'),
                    })}
                    {...moveEndProps}
                    onClick={() => {
                        endInputRef.current?.focus();
                    }}
                >
                    <div className={b('slider-input-wrapper')}>
                        <input
                            id={`${id}-end`}
                            ref={endInputRef}
                            className={b('slider-input')}
                            type="range"
                            step={1}
                            aria-label={i18n('End of range')}
                            aria-labelledby={[`${id}-end`, props['aria-labelledby']]
                                .filter(Boolean)
                                .join(' ')}
                            aria-orientation="horizontal"
                            aria-valuetext={`${endValue.format()}`}
                            value={0}
                            onChange={() => {}}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
