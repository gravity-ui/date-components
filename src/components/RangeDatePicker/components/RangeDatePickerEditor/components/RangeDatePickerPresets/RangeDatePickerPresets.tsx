import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {List, useMobile} from '@gravity-ui/uikit';

import {block} from '../../../../../../utils/cn';
import type {
    RangeDatepickerPreset,
    RangeDatepickerPresetTab,
    RangeDatepickerValue,
} from '../../../../types';

import './RangeDatePickerPresets.scss';

export const b = block('range-date-picker-presets');

function renderPreset(item: RangeDatepickerPreset) {
    return item.title;
}

interface Props {
    presetTabs: RangeDatepickerPresetTab[];
    onUpdatePreset: (start: string, end: string) => void;

    value?: RangeDatepickerValue | null;
}

export function RangeDatePickerPresets(props: Props) {
    const {presetTabs, onUpdatePreset, value} = props;

    const [mobile] = useMobile();

    const [visibleTab, setVisibleTab] = React.useState<RangeDatepickerPresetTab | null>(
        presetTabs[0] || null,
    );

    function getSelectedPresetIndex() {
        const index = visibleTab?.presets.findIndex((preset) => {
            return preset.start === value?.start?.value && preset.end === value?.end?.value;
        });
        return typeof index === 'number' ? index : undefined;
    }

    return (
        <div className={b()}>
            <AdaptiveTabs
                items={presetTabs}
                activeTab={visibleTab?.id}
                onSelectTab={(id: string) => {
                    if (visibleTab?.id === id) {
                        return;
                    }
                    setVisibleTab(presetTabs.find((tab) => tab.id === id) || null);
                }}
            />
            {visibleTab ? (
                <List
                    className={b('list')}
                    itemClassName={b('item', {mobile})}
                    items={visibleTab.presets}
                    selectedItemIndex={getSelectedPresetIndex()}
                    filterable={false}
                    virtualized={false}
                    renderItem={renderPreset}
                    onItemClick={(item: RangeDatepickerPreset) => {
                        onUpdatePreset(item.start, item.end);
                    }}
                />
            ) : null}
        </div>
    );
}
