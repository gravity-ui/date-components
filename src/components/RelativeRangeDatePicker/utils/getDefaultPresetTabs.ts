import {i18n} from '../components/RelativeRangeDatePickerEditor/components/RelativeRangeDatePickerPresets/i18n';
import {defaultDatePresets, defaultTimePresets, mainTabId, othersTabId} from '../consts';

export function getDefaultPresetTabs(withTime?: boolean) {
    return [
        {
            id: mainTabId,
            title: i18n('Tab_main'),
            presets: withTime ? [...defaultTimePresets, ...defaultDatePresets] : defaultDatePresets,
        },
        {
            id: othersTabId,
            title: i18n('Tab_main'),
            presets: [],
        },
    ];
}
