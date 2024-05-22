import React from 'react';

import {ThinTimeRulerSelection, ThinTimelineRuler} from '../../../components/ThinTimeline';
import type {RenderThinTimelineSelectionOptions} from '../../../components/ThinTimeline';

export default function SelectionWithCustomTooltipDemo() {
    const [{start: periodStart, end: periodEnd}, setPeriod] = React.useState({
        start: Date.now() - 300000,
        end: Date.now(),
    });

    const renderSelection = React.useCallback(
        (opts: RenderThinTimelineSelectionOptions) => {
            return (
                <React.Fragment>
                    <ThinTimeRulerSelection
                        {...opts}
                        start={periodStart}
                        end={periodEnd}
                        showTooltip
                        onUpdate={setPeriod}
                    />
                </React.Fragment>
            );
        },
        [periodEnd, periodStart],
    );

    return (
        <div>
            <p>
                Uses prop <code>showTooltip</code>, to show tooltips.
            </p>

            <ThinTimelineRuler
                start={periodStart}
                end={periodEnd}
                hasZoomButtons
                renderSelection={renderSelection}
            />
        </div>
    );
}
