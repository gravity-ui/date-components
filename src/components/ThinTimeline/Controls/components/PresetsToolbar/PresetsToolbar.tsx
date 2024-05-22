import React from 'react';

import {Flex} from '@gravity-ui/uikit';

import type {RelativeRangeDatePickerProps} from '../../../../RelativeRangeDatePicker';
import {useRelativePeriodPicker} from '../../hooks';
import {extractPeriodFromRelativeDate, isPeriodLikeDate} from '../../presets';
import {CustomPresetButton} from '../CustomPresetButton/CustomPresetButton';
import {PresetButton} from '../PresetButton/PresetButton';

interface PresetsToolbarProps extends RelativeRangeDatePickerProps {
    presets: string[];
    hasCustom?: boolean;
    customPresetButtonSuggestLimit?: string;
    onUpdate: (value: RelativeRangeDatePickerProps['value']) => void;
}

export function PresetsToolbar({
    value,
    presets,
    hasCustom,
    customPresetButtonSuggestLimit,
    onUpdate,
}: PresetsToolbarProps) {
    const handleClick = useRelativePeriodPicker(onUpdate);

    const selectedPreset = React.useMemo(() => {
        if (
            value?.start?.type !== 'relative' ||
            value.end?.type !== 'relative' ||
            !value.start.value ||
            value.end.value !== 'now'
        ) {
            return undefined;
        }

        if (!isPeriodLikeDate(value.start.value)) {
            return undefined;
        }

        return extractPeriodFromRelativeDate(value.start.value);
    }, [value]);

    const buttons = presets.map((preset) => (
        <PresetButton key={preset} value={preset} selected={selectedPreset} onClick={handleClick} />
    ));

    const isCustomPreset = React.useMemo(
        () => (selectedPreset ? !presets.includes(selectedPreset) : false),
        [selectedPreset, presets],
    );

    return (
        <Flex gap="0.5">
            {buttons}
            {hasCustom && (
                <CustomPresetButton
                    value={isCustomPreset ? selectedPreset : undefined}
                    suggestLimit={customPresetButtonSuggestLimit}
                    onUpdate={handleClick}
                />
            )}
        </Flex>
    );
}
