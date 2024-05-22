import React from 'react';

import type {RulerViewport} from '../../../types';
import {clamp} from '../../../utils/clamp';
import {UNIT_SPAN, getLerpCoeff, lerp, rescaleSpan} from '../../../utils/spans';
import {useSimpleDrag} from '../../hooks';
import type {DragData} from '../../hooks';

interface UseViewportDraggerOptions extends RulerViewport {
    viewportMinStart?: number;
    viewportMaxEnd?: number;
    viewportWidth: number;
    onViewportUpdate?: (value: RulerViewport) => void;

    viewportRef: React.RefObject<HTMLElement>;
    viewportMinLength: number;
    viewportMaxLength: number;
}

interface DragInfo extends RulerViewport {
    viewportMinStart?: number;
    viewportMaxEnd?: number;
    viewportWidth: number;
    xToTimeCoeff: number;
    isResizing: boolean;
    viewportX: number;
    viewportMinLength: number;
    viewportMaxLength: number;
}

const MIN_DRAG_SCALE_COEFF = 0.01;
const MAX_DRAG_SCALE_COEFF = 100;
const DRAG_SCALE_STRENGTH_COEFF = 20;

function adjustViewport(info: DragInfo, dx: number, xStart: number) {
    const viewportLength = info.viewportEnd - info.viewportStart;
    let shifted: RulerViewport;
    if (info.isResizing) {
        // some maths, incomprehensible without a sheet of paper
        const minScaleCoeff = Math.max(
            MIN_DRAG_SCALE_COEFF,
            info.viewportMinLength / viewportLength,
        );
        const maxScaleCoeff = Math.min(
            MAX_DRAG_SCALE_COEFF,
            info.viewportMaxLength / viewportLength,
        );
        const mult = clamp(
            Math.exp((-dx * DRAG_SCALE_STRENGTH_COEFF) / info.viewportWidth),
            minScaleCoeff,
            maxScaleCoeff,
        );
        const fixedPoint = lerp(
            {start: info.viewportX, end: info.viewportWidth},
            UNIT_SPAN,
            xStart,
        );
        const {start: viewportStart, end: viewportEnd} = rescaleSpan({
            start: info.viewportStart,
            end: info.viewportEnd,
            fixedPoint,
            scale: mult,
        });
        shifted = {viewportStart, viewportEnd};
    } else {
        const dt = -dx * info.xToTimeCoeff;
        shifted = {
            viewportStart: Math.round(info.viewportStart + dt),
            viewportEnd: Math.round(info.viewportEnd + dt),
        };
    }

    if (
        typeof info.viewportMinStart === 'number' &&
        info.viewportMinStart < shifted.viewportStart
    ) {
        shifted.viewportStart = info.viewportMinStart;
        shifted.viewportEnd = info.viewportMinStart + viewportLength;
    } else if (
        typeof info.viewportMaxEnd === 'number' &&
        shifted.viewportEnd < info.viewportMaxEnd
    ) {
        shifted.viewportStart = info.viewportMaxEnd - viewportLength;
        shifted.viewportEnd = info.viewportMaxEnd;
    }

    return shifted;
}

export const useViewportDragger = ({
    viewportMinStart,
    viewportMaxEnd,
    viewportStart,
    viewportEnd,
    viewportWidth,
    onViewportUpdate,
    viewportRef,
    viewportMinLength,
    viewportMaxLength,
}: UseViewportDraggerOptions) => {
    const [tempViewport, setTempViewport] = React.useState<RulerViewport | null>(null);

    const dragInfoRef = React.useRef<DragInfo>({
        viewportMinStart,
        viewportMaxEnd,
        viewportStart,
        viewportEnd,
        viewportWidth,
        xToTimeCoeff: 1,
        isResizing: false,
        viewportX: 0,
        viewportMinLength,
        viewportMaxLength,
    });

    const onInit = React.useCallback(
        (ev: React.MouseEvent) => {
            // setting values in stone for the drag process
            Object.assign(dragInfoRef.current, {
                viewportMinStart,
                viewportMaxEnd,
                viewportStart,
                viewportEnd,
                viewportWidth,
                xToTimeCoeff: getLerpCoeff(
                    {start: 0, end: viewportWidth},
                    {start: viewportStart, end: viewportEnd},
                ),
                isResizing: ev.ctrlKey || ev.shiftKey || ev.altKey || ev.metaKey,
                viewportX: viewportRef.current?.getBoundingClientRect().x ?? 0,
                viewportMinLength,
                viewportMaxLength,
            });
        },
        [
            viewportEnd,
            viewportMaxEnd,
            viewportMaxLength,
            viewportMinLength,
            viewportMinStart,
            viewportRef,
            viewportStart,
            viewportWidth,
        ],
    );

    const onDrag = React.useCallback(({dx, xStart}: DragData) => {
        setTempViewport(adjustViewport(dragInfoRef.current, dx, xStart));
    }, []);
    const onDrop = React.useCallback(
        ({dx, xStart}: DragData) => {
            setTempViewport(null);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            onViewportUpdate!(adjustViewport(dragInfoRef.current, dx, xStart));
        },
        [onViewportUpdate],
    );

    const onMouseDown = useSimpleDrag({onInit, onDrag, onDrop});

    return {
        viewportStart: tempViewport ? tempViewport.viewportStart : viewportStart,
        viewportEnd: tempViewport ? tempViewport.viewportEnd : viewportEnd,
        onMouseDown: onViewportUpdate ? onMouseDown : undefined,
    };
};
