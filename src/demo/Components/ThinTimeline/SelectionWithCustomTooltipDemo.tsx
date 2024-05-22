import React from 'react';

import {spacing} from '@gravity-ui/uikit';

import {ThinTimeRulerSelection, ThinTimelineRuler} from '../../../components/ThinTimeline';
import type {RenderThinTimelineSelectionOptions} from '../../../components/ThinTimeline';
import {block} from '../../utils/cn';

import './SelectionWithCustomTooltipDemo.scss';

const b = block('thin-timeline-selection-with-tooltip-demo');

const renderLeftHandleTooltip = (actualPeriodEnd: number) => {
    return (
        <div className={b('tooltip', spacing({mr: 1}))}>
            {new Date(actualPeriodEnd).toDateString()}
        </div>
    );
};

const renderRightHandleTooltip = (actualPeriodEnd: number) => {
    return (
        <div className={b('tooltip', spacing({ml: 1}))}>
            {new Date(actualPeriodEnd).toLocaleTimeString()}
        </div>
    );
};

export default function SelectionWithCustomTooltipDemo() {
    const [{start: periodStart, end: periodEnd}, setPeriod2] = React.useState({
        start: Date.now() - 900000,
        end: Date.now() - 600000,
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
                        onUpdate={setPeriod2}
                        tooltipOverflowPosition={'bottom'}
                        renderLeftHandleTooltip={renderLeftHandleTooltip}
                        renderRightHandleTooltip={renderRightHandleTooltip}
                    />
                </React.Fragment>
            );
        },
        [periodEnd, periodStart],
    );

    return (
        <div>
            <p>
                You can pass the prop for tooltips&apos; render <code>renderLeftHandleTooltip</code>
                and
                <code>renderRightHandleTooltip</code>.
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
