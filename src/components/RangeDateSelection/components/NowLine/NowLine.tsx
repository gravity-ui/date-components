// import {dateTime} from '@gravity-ui/date-utils';

import React from 'react';

import {block} from '../../../../utils/cn';
import {SECOND} from '../../../utils/constants';
import {useViewportDimensions, useViewportInterval} from '../Ruler/Ruler';

const MIN_UPDATE_DISTANCE = 4; // in px

import './NowLine.scss';

const b = block('timeline-now-line');

export function NowLine() {
    const viewport = useViewportDimensions();
    const {start: startDate, end: endDate} = useViewportInterval();
    const [, rerender] = React.useState({});

    const nowTime = Date.now();
    const needUpdateNow = endDate.valueOf() > nowTime;
    const interval = Math.max(
        SECOND,
        (MIN_UPDATE_DISTANCE * endDate.diff(startDate)) / viewport.width,
        startDate.valueOf() - nowTime,
    );

    React.useEffect(() => {
        let timer: number | null = null;
        if (needUpdateNow) {
            timer = window.setInterval(() => {
                rerender({});
            }, interval);
        }
        return () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };
    }, [needUpdateNow, interval]);

    if (nowTime < startDate.valueOf() || endDate.valueOf() < nowTime) {
        return null;
    }

    const nowX =
        ((nowTime - startDate.valueOf()) / (endDate.valueOf() - startDate.valueOf())) *
        viewport.width;

    return <path d={`M${nowX},0l0,${viewport.height}`} className={b()} />;
}
