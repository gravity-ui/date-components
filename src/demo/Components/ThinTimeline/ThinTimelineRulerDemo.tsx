import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Button} from '@gravity-ui/uikit';

import {ThinTimelineRuler} from '../../../components';
import type {UncontrolledThinTimelineRulerProps} from '../../../components/ThinTimeline/Ruler/Ruler';
import {DAY} from '../../../components/ThinTimeline/constants';

export const ThinTimelineRulerDemo = (props: UncontrolledThinTimelineRulerProps) => {
    const [{start, end}, setPeriod] = React.useState({
        start: Date.now() - DAY,
        end: Date.now(),
    });

    return (
        <div>
            <ThinTimelineRuler {...props} start={start} end={end} onUpdate={setPeriod} />
            <div style={{marginTop: 16}}>
                <Button
                    style={{marginRight: 8}}
                    onClick={() => {
                        setPeriod({
                            start: dateTime({input: '2023-10-29T00:00:00.000Z'}).valueOf(),
                            end: dateTime({input: '2023-10-29T01:00:00.000Z'}).valueOf(),
                        });
                    }}
                >
                    {'Summer -> Winter'}
                </Button>
                <Button
                    onClick={() => {
                        setPeriod({
                            start: dateTime({input: '2023-03-26T00:00:00.000Z'}).valueOf(),
                            end: dateTime({input: '2023-03-26T01:00:00.000Z'}).valueOf(),
                        });
                    }}
                >
                    {'Winter -> Summer'}
                </Button>
            </div>
        </div>
    );
};
