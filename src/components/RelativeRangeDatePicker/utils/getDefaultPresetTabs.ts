import {i18n} from '../RelativeRangeDatePickerEditor/RelativeRangeDatePickerPresets/i18n';
import {
    defaultDatePresets,
    defaultOtherPresets,
    defaultTimePresets,
    mainTabId,
    othersTabId,
} from '../consts';

export function getDefaultPresetTabs(withTimePresets?: boolean) {
    return [
        {
            id: mainTabId,
            title: i18n('Tab_main'),
            presets: withTimePresets
                ? [...defaultTimePresets, ...defaultDatePresets]
                : defaultDatePresets,
        },
        {
            id: othersTabId,
            title: i18n('Tab_others'),
            presets: defaultOtherPresets,
        },
    ];
}
