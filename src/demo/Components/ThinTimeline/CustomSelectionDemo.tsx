import React from 'react';

import {ThinTimeRulerSelection, ThinTimelineRuler} from '../../../components/ThinTimeline';
import type {RenderThinTimelineSelectionOptions} from '../../../components/ThinTimeline';
import {block} from '../../utils/cn';

import './CustomSelectionDemo.scss';

const b = block('thin-timeline-custom-selection-demo');

export default function CustomSelectionDemo() {
    const [{start: period1Start, end: period1End}, setPeriod1] = React.useState({
        start: Date.now() - 300000,
        end: Date.now(),
    });
    const [{start: period2Start, end: period2End}, setPeriod2] = React.useState({
        start: Date.now() - 900000,
        end: Date.now() - 600000,
    });

    const renderSelection = React.useCallback(
        (opts: RenderThinTimelineSelectionOptions) => {
            return (
                <React.Fragment>
                    <ThinTimeRulerSelection
                        {...opts}
                        start={period1Start}
                        end={period1End}
                        onUpdate={setPeriod1}
                        className={b('1')}
                    />
                    <ThinTimeRulerSelection
                        {...opts}
                        start={period2Start}
                        end={period2End}
                        onUpdate={setPeriod2}
                        className={b('2')}
                    />
                </React.Fragment>
            );
        },
        [period1End, period1Start, period2End, period2Start],
    );

    return (
        <div>
            Used prop <code>renderSelection</code>, which contains 2 components{' '}
            <code>ThinTimeRulerSelection</code>. Restrictions on mutual intervals position must be
            implemented by component&apos;s user.
            <ThinTimelineRuler
                start={Math.min(period1Start, period2Start)}
                end={Math.max(period1End, period2End)}
                hasZoomButtons
                renderSelection={renderSelection}
            />
        </div>
    );
}
