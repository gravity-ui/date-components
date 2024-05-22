import React from 'react';

import {setupGlobalDragHandlers} from '../drag';

const MIN_DRAG_DISTANCE_SQUARED = 16;
const LMB = 0;
enum DragState {
    Off,
    Preparing,
    Dragging,
}

interface DragInfo {
    xStart: number;
    yStart: number;
    state: DragState;
}

export interface DragData {
    xStart: number;
    yStart: number;
    dx: number;
    dy: number;
}

interface UseSimpleDragOptions {
    onInit?: (ev: React.MouseEvent) => void;
    onTakeOff?: (data: DragData, ev: MouseEvent) => void;
    onDrag?: (data: DragData, ev: MouseEvent) => void;
    onDrop?: (data: DragData, ev: MouseEvent) => void;
    onMouseUpPreparing?: (ev: MouseEvent) => void;
}

export const useSimpleDrag = ({
    onInit,
    onTakeOff,
    onDrag,
    onDrop,
    onMouseUpPreparing,
}: UseSimpleDragOptions) => {
    const dragInfo = React.useRef<DragInfo>({
        xStart: -1,
        yStart: -1,
        state: DragState.Off,
    });

    const onMouseDown = React.useCallback(
        (ev: React.MouseEvent) => {
            const info = dragInfo.current;
            if (ev.button !== LMB || info.state !== DragState.Off) {
                return;
            }

            info.xStart = ev.clientX;
            info.yStart = ev.clientY;
            info.state = DragState.Preparing;
            onInit?.(ev);

            setupGlobalDragHandlers(
                {
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    onMouseMove: (ev: MouseEvent) => {
                        // eslint-disable-next-line @typescript-eslint/no-shadow
                        const info = dragInfo.current;

                        if (info.state === DragState.Preparing) {
                            if (
                                (info.xStart - ev.clientX) ** 2 + (info.yStart - ev.clientY) ** 2 >
                                MIN_DRAG_DISTANCE_SQUARED
                            ) {
                                info.state = DragState.Dragging;
                                onTakeOff?.(
                                    {
                                        dx: ev.clientX - info.xStart,
                                        dy: ev.clientY - info.yStart,
                                        xStart: info.xStart,
                                        yStart: info.yStart,
                                    },
                                    ev,
                                );
                            }
                        }
                        if (info.state !== DragState.Dragging) {
                            return;
                        }

                        onDrag?.(
                            {
                                dx: ev.clientX - info.xStart,
                                dy: ev.clientY - info.yStart,
                                xStart: info.xStart,
                                yStart: info.yStart,
                            },
                            ev,
                        );
                    },
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    onMouseUp: (ev: MouseEvent) => {
                        // eslint-disable-next-line @typescript-eslint/no-shadow
                        const info = dragInfo.current;
                        if (info.state === DragState.Off) {
                            return;
                        } else if (info.state === DragState.Preparing) {
                            onMouseUpPreparing?.(ev);
                            info.state = DragState.Off;
                            return;
                        }

                        onDrop?.(
                            {
                                dx: ev.clientX - info.xStart,
                                dy: ev.clientY - info.yStart,
                                xStart: info.xStart,
                                yStart: info.yStart,
                            },
                            ev,
                        );
                        info.state = DragState.Off;
                    },
                },
                ev,
            );
        },
        [onInit, onDrag, onTakeOff, onDrop, onMouseUpPreparing],
    );

    return onMouseDown;
};
