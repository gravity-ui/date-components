import React from 'react';

import {useEventHandler} from './useEventHandler';

export type PointerType = 'mouse' | 'pen' | 'touch' | 'keyboard';

interface EventBase {
    shiftKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
}

interface BaseMoveEvent extends EventBase {
    pointerType: PointerType;
}

export interface MoveStartEvent extends BaseMoveEvent {
    type: 'movestart';
}

export interface MoveMoveEvent extends BaseMoveEvent {
    type: 'move';
    deltaX: number;
    deltaY: number;
}

export interface MoveEndEvent extends BaseMoveEvent {
    type: 'moveend';
}

export interface MoveEvents {
    onMoveStart?: (e: MoveStartEvent) => void;
    onMove?: (e: MoveMoveEvent) => void;
    onMoveEnd?: (e: MoveEndEvent) => void;
}

export function useMove(props: MoveEvents) {
    const {onMoveStart, onMove, onMoveEnd} = props;

    const state = React.useRef<{
        isMoving: boolean;
        lastPosition: null | {pageX: number; pageY: number};
        id: null | number;
    }>({
        isMoving: false,
        lastPosition: null,
        id: null,
    });

    const move = useEventHandler(
        (originalEvent: EventBase, deltaX: number, deltaY: number, pointerType: PointerType) => {
            if (deltaX === 0 && deltaY === 0) {
                return;
            }

            if (!state.current.isMoving) {
                state.current.isMoving = true;
                onMoveStart?.({
                    type: 'movestart',
                    pointerType,
                    shiftKey: originalEvent.shiftKey,
                    ctrlKey: originalEvent.ctrlKey,
                    metaKey: originalEvent.metaKey,
                    altKey: originalEvent.altKey,
                });
            }
            onMove?.({
                type: 'move',
                pointerType,
                deltaX,
                deltaY,
                shiftKey: originalEvent.shiftKey,
                ctrlKey: originalEvent.ctrlKey,
                metaKey: originalEvent.metaKey,
                altKey: originalEvent.altKey,
            });
        },
    );

    const end = useEventHandler((originalEvent: EventBase, pointerType: PointerType) => {
        if (state.current.isMoving) {
            state.current.isMoving = false;
            onMoveEnd?.({
                type: 'moveend',
                pointerType,
                shiftKey: originalEvent.shiftKey,
                ctrlKey: originalEvent.ctrlKey,
                metaKey: originalEvent.metaKey,
                altKey: originalEvent.altKey,
            });
        }
    });

    return React.useMemo(() => {
        const moveProps: React.DOMAttributes<HTMLElement> = {};

        if (typeof PointerEvent === 'undefined') {
            moveProps.onMouseDown = (e) => {
                if (e.button === 0) {
                    state.current.isMoving = false;
                    e.preventDefault();
                    state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};

                    const handleMouseMove = (ev: MouseEvent) => {
                        if (ev.buttons === 0) {
                            move(
                                ev,
                                ev.pageX - (state.current.lastPosition?.pageX || 0),
                                ev.pageY - (state.current.lastPosition?.pageY || 0),
                                'mouse',
                            );
                            state.current.lastPosition = {pageX: ev.pageX, pageY: ev.pageY};
                        }
                    };
                    const handleMouseUp = (ev: MouseEvent) => {
                        if (ev.button === 0) {
                            end(ev, 'mouse');
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                        }
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                }
            };

            moveProps.onTouchStart = (e) => {
                if (e.touches.length === 0 || state.current.id !== null) {
                    return;
                }

                const {pageX, pageY, identifier} = e.touches[0];
                state.current.id = identifier;
                state.current.lastPosition = {pageX, pageY};
                e.preventDefault();

                const handleTouchMove = (ev: TouchEvent) => {
                    const touch = [...ev.changedTouches].findIndex(
                        (el) => el.identifier === state.current.id,
                    );
                    if (touch !== -1) {
                        const {pageX, pageY} = e.changedTouches[touch];
                        move(
                            ev,
                            pageX - (state.current.lastPosition?.pageX || 0),
                            pageY - (state.current.lastPosition?.pageY || 0),
                            'touch',
                        );
                        state.current.lastPosition = {pageX, pageY};
                    }
                };
                const handleTouchEnd = (ev: TouchEvent) => {
                    const touch = [...ev.changedTouches].findIndex(
                        (el) => el.identifier === state.current.id,
                    );
                    if (touch !== -1) {
                        end(ev, 'touch');
                        state.current.id = null;
                        window.removeEventListener('touchmove', handleTouchMove);
                        window.removeEventListener('touchend', handleTouchEnd);
                        window.removeEventListener('touchcancel', handleTouchEnd);
                    }
                };
                window.addEventListener('touchmove', handleTouchMove);
                window.addEventListener('touchend', handleTouchEnd);
                window.addEventListener('touchcancel', handleTouchEnd);
            };
        } else {
            moveProps.onPointerDown = (e) => {
                if (e.button === 0 && state.current.id === null) {
                    e.preventDefault();
                    state.current.isMoving = false;
                    state.current.id = e.pointerId;
                    state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};

                    const handlePointerMove = (ev: PointerEvent) => {
                        if (ev.pointerId === state.current.id) {
                            move(
                                ev,
                                ev.pageX - (state.current.lastPosition?.pageX || 0),
                                ev.pageY - (state.current.lastPosition?.pageY || 0),
                                (ev.pointerType || 'mouse') as PointerType,
                            );
                            state.current.lastPosition = {pageX: ev.pageX, pageY: ev.pageY};
                        }
                    };
                    const handlePointerUp = (ev: PointerEvent) => {
                        if (ev.pointerId === state.current.id) {
                            end(ev, (ev.pointerType || 'mouse') as PointerType);
                            state.current.id = null;
                            window.removeEventListener('pointermove', handlePointerMove);
                            window.removeEventListener('pointerup', handlePointerUp);
                            window.removeEventListener('pointercancel', handlePointerUp);
                        }
                    };
                    window.addEventListener('pointermove', handlePointerMove);
                    window.addEventListener('pointerup', handlePointerUp);
                    window.addEventListener('pointercancel', handlePointerUp);
                }
            };
        }

        const handleKeyboardMove = (e: EventBase, deltaX: number, deltaY: number) => {
            state.current.isMoving = false;
            move(e, deltaX, deltaY, 'keyboard');
            end(e, 'keyboard');
        };

        moveProps.onKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowLeft': {
                    e.preventDefault();
                    handleKeyboardMove(e, -1, 0);
                    break;
                }
                case 'ArrowRight': {
                    e.preventDefault();
                    handleKeyboardMove(e, 1, 0);
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    handleKeyboardMove(e, 0, -1);
                    break;
                }
                case 'ArrowDown': {
                    e.preventDefault();
                    handleKeyboardMove(e, 0, 1);
                    break;
                }
            }
        };

        return {moveProps};
    }, [end, move]);
}
