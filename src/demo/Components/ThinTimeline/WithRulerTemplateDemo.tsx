import React from 'react';

import {ThinTimelineControls, ThinTimelineRuler, useThinTimelineRuler} from '../../../components';
import type {ThinTimelineControlsProps} from '../../../components';

export const WithRulerTemplateDemo = (props: ThinTimelineControlsProps) => {
    const [value, onUpdate] = React.useState<ThinTimelineControlsProps['value']>({
        start: {type: 'relative', value: 'now-15m'},
        end: {type: 'relative', value: 'now'},
    });
    const {fromMillis, toMillis, onUpdateMillis} = useThinTimelineRuler({
        start: value?.start,
        end: value?.end,
        onUpdate,
    });
    const [refreshInterval, setRefreshInterval] = React.useState(0);

    return (
        <div>
            <ThinTimelineControls
                {...props}
                timeZone={props.timeZone === 'Empty' ? undefined : props.timeZone}
                value={value}
                onUpdate={onUpdate}
                refreshInterval={refreshInterval}
                onRefreshIntervalUpdate={setRefreshInterval}
                onRefreshClick={() => {
                    alert('Refresh clicked!');
                }}
                defaultRefreshInterval={15000}
                alwaysShowAsAbsolute={false}
                prepend={
                    <React.Fragment>
                        <div
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                alignSelf: 'center',
                                flex: '0 0 auto',
                            }}
                        >
                            Jsx-node
                        </div>
                        <div style={{flex: '1 1 auto'}} />
                    </React.Fragment>
                }
            />
            <ThinTimelineRuler
                timeZone={props.timeZone === 'Empty' ? undefined : props.timeZone}
                start={fromMillis}
                end={toMillis}
                displayNow
                hasZoomButtons
                onUpdate={onUpdateMillis}
            />
        </div>
    );
};
