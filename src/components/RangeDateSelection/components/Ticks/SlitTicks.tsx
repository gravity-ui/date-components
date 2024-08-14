import type {DateTime} from '@gravity-ui/date-utils';

import {useViewportDimensions} from '../Ruler/Ruler';

import {Ticks, makeSlitTicksGeometry} from './Ticks';

export function SlitTicks({
    formatTime,
    timeZone,
}: {
    formatTime?: (time: DateTime) => string;
    timeZone?: string;
}) {
    const {height} = useViewportDimensions();
    return (
        <Ticks
            minTickWidth={80}
            maxTickWidth={200}
            theme="normal"
            geometry={makeSlitTicksGeometry({tickHeight: 4, viewportHeight: height})}
            hasLabels
            formatTime={formatTime}
            timeZone={timeZone}
        />
    );
}
