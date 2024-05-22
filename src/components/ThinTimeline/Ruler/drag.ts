import type React from 'react';

function preventGlobalMouseEvents() {
    document.body.style.pointerEvents = 'none';
}

function restoreGlobalMouseEvents() {
    document.body.style.pointerEvents = 'auto';
}

const MODE = {capture: true};

interface Handlers {
    onMouseMove: (ev: MouseEvent) => void;
    onMouseUp: (ev: MouseEvent) => void;
}

export function setupGlobalDragHandlers({onMouseMove, onMouseUp}: Handlers, ev: React.MouseEvent) {
    function mousemoveListener(e: MouseEvent) {
        e.stopPropagation();
        onMouseMove(e);
        // do whatever is needed while the user is moving the cursor around
    }

    function mouseupListener(e: MouseEvent) {
        restoreGlobalMouseEvents();
        document.removeEventListener('mouseup', mouseupListener, MODE);
        document.removeEventListener('mousemove', mousemoveListener, MODE);
        e.stopPropagation();
        onMouseUp(e);
    }

    preventGlobalMouseEvents();
    document.addEventListener('mouseup', mouseupListener, MODE);
    document.addEventListener('mousemove', mousemoveListener, MODE);
    ev.preventDefault();
    ev.stopPropagation();
}
