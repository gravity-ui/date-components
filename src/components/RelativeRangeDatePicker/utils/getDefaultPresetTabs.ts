import {i18n} from '../components/RelativeRangeDatePickerEditor/components/RelativeRangeDatePickerPresets/i18n';
import {defaultDatePresets, defaultTimePresets, mainTabId, othersTabId} from '../consts';
import {defaultOtherPresets} from '../consts/defaultOtherPresets';

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
