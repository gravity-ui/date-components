import {useViewportDimensions} from '../Ruler/Ruler';

import {Ticks, makeMiddleTicksGeometry} from './Ticks';

export function MiddleTicks({timeZone}: {timeZone?: string}) {
    const {height} = useViewportDimensions();
    return (
        <Ticks
            minTickWidth={8}
            maxTickWidth={20}
            theme="dim"
            geometry={makeMiddleTicksGeometry({tickHeight: 4, viewportHeight: height})}
            timeZone={timeZone}
        />
    );
}
