import React from 'react';

import type {RulerViewport} from '../../../types';

interface UseNowLineOptions extends RulerViewport {
    viewportWidth: number;
    viewportHeight: number;
    displayNow: boolean | undefined;
}

const MIN_UPDATE_DISTANCE = 4; // px

export const useNowLine = ({
    viewportStart,
    viewportEnd,
    viewportWidth,
    viewportHeight,
    displayNow,
}: UseNowLineOptions) => {
    const minUpdateTime = Math.floor(
        (MIN_UPDATE_DISTANCE * (viewportEnd - viewportStart)) / viewportWidth,
    );
    const memoObsolesenceFactor = Math.floor(Date.now() / minUpdateTime);

    return React.useMemo(() => {
        const nowTime = Date.now();
        if (!displayNow || nowTime < viewportStart || viewportEnd < nowTime) {
            return null;
        }

        const nowX = ((nowTime - viewportStart) / (viewportEnd - viewportStart)) * viewportWidth;

        return `M${nowX},0l0,${viewportHeight}`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        displayNow,
        viewportHeight,
        viewportEnd,
        viewportStart,
        viewportWidth,
        memoObsolesenceFactor,
    ]);
};
