import React from 'react';

import {ThinTimelineControls} from '../../../components';
import type {ThinTimelineControlsProps} from '../../../components';

export const ThinTimelineControlsDemo = (props: ThinTimelineControlsProps) => {
    const [value, onUpdate] = React.useState<ThinTimelineControlsProps['value']>({
        start: {type: 'relative', value: 'now-1h'},
        end: {type: 'relative', value: 'now'},
    });
    const [refreshInterval, setRefreshInterval] = React.useState(60000);

    return (
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <ThinTimelineControls
                {...props}
                timeZone={props.timeZone === 'Empty' ? undefined : props.timeZone}
                value={value}
                onUpdate={onUpdate}
                refreshInterval={refreshInterval}
                onRefreshIntervalUpdate={setRefreshInterval}
                defaultRefreshInterval={60000}
                suggestLimit={'2w'}
            />
        </div>
    );
};
