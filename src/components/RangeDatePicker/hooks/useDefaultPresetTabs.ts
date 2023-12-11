import React from 'react';

import {i18n} from '../components/RangeDatePickerEditor/components/RangeDatePickerPresets/i18n';
import {defaultDatePresets, defaultTimePresets, mainTabId, othersTabId} from '../consts';
import type {RangeDatepickerPresetTab} from '../types';

export function useDefaultPresetTabs(withTime?: boolean) {
    return React.useMemo((): RangeDatepickerPresetTab[] => {
        return [
            {
                id: mainTabId,
                title: i18n('Tab_main'),
                presets: withTime
                    ? [...defaultTimePresets, ...defaultDatePresets]
                    : defaultDatePresets,
            },
            {
                id: othersTabId,
                title: i18n('Tab_main'),
                presets: [],
            },
        ];
    }, [withTime]);
}
