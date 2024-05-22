import React from 'react';

import {ThinTimelineRuler, ThinTimelineTicks} from '../../../components/ThinTimeline';
import type {RenderThinTimelineSelectionOptions} from '../../../components/ThinTimeline';
import {block} from '../../utils/cn';

import './CustomTicksDemo.scss';

const b = block('thin-timeline-custom-ticks-demo');

export default function CustomTicksDemo() {
    const [{start, end}, setPeriod] = React.useState({
        start: Date.now() - 300000,
        end: Date.now(),
    });

    const renderSvg = React.useCallback((opts: RenderThinTimelineSelectionOptions) => {
        const w = 10;
        const h = opts.viewportHeight;
        const customTickGeometry = (x: number) => `M${x},0l${h},${h}l${w},0l${-h},${-h}l${-w},0`;

        return (
            <ThinTimelineTicks
                {...opts}
                minTickWidth={10}
                maxTickWidth={50}
                theme="dim"
                geometry={customTickGeometry}
                className={b('tick')}
            />
        );
    }, []);

    return (
        <div>
            Uses prop <code>renderAdditionalSvg</code>, inside which render additional ticks with
            <code>ThinTimelineTicks</code>
            <ThinTimelineRuler
                start={start}
                end={end}
                onUpdate={setPeriod}
                hasZoomButtons
                renderAdditionalSvg={renderSvg}
            />
        </div>
    );
}
