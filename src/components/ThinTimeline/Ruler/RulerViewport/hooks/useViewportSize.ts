import React from 'react';

export const useViewportSize = (ref: React.RefObject<HTMLElement>) => {
    const [viewportWidth, setViewportWidth] = React.useState(0);
    const [viewportHeight, setViewportHeight] = React.useState(0);

    const updateViewportSize = React.useCallback(() => {
        const rect = ref.current?.getBoundingClientRect();
        const width = rect?.width;
        const height = rect?.height;
        if (width && height) {
            requestAnimationFrame(() => {
                setViewportWidth(width);
                setViewportHeight(height);
            });
        }
    }, [ref]);

    React.useLayoutEffect(updateViewportSize, [updateViewportSize]);
    React.useEffect(() => {
        window.addEventListener('resize', updateViewportSize);
        return () => window.removeEventListener('resize', updateViewportSize);
    }, [updateViewportSize]);

    return {viewportWidth, viewportHeight};
};
