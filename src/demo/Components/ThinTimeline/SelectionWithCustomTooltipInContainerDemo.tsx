import React from 'react';

import {ThinTimeRulerSelection, ThinTimelineRuler} from '../../../components/ThinTimeline';
import type {RenderThinTimelineSelectionOptions} from '../../../components/ThinTimeline';
import {block} from '../../utils/cn';

import './SelectionWithTooltipInContainerDemo.scss';

const b = block('thin-timeline-selection-with-tooltip-container-demo');

export default function SelectionWithCustomTooltipInContainerDemo() {
    const [{start: periodStart, end: periodEnd}, setPeriod1] = React.useState({
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
                        onUpdate={setPeriod1}
                    />
                </React.Fragment>
            );
        },
        [periodEnd, periodStart],
    );

    return (
        <div className={b()}>
            <div className={b('side-bar')}></div>
            <div className={b('content')}>
                <p>Tooltips change their location when leave the viewport</p>

                <ThinTimelineRuler
                    start={periodStart}
                    end={periodEnd}
                    hasZoomButtons
                    renderSelection={renderSelection}
                />
            </div>
            <div className={b('side-bar')}></div>
        </div>
    );
}
