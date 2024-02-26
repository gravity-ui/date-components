import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {type DateTime, dateTimeParse} from '@gravity-ui/date-utils';
import {List, useMobile} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import type {
    RelativeRangeDatepickerPreset,
    RelativeRangeDatepickerPresetTab,
    RelativeRangeDatepickerValue,
} from '../../types';

import {RelativeDatePickerPresetsHint} from './RelativeDatePickerPresetsHint';

import './RelativeRangeDatePickerPresets.scss';

export const b = block('relative-range-date-picker-presets');

function renderPreset(item: RelativeRangeDatepickerPreset) {
    return item.title;
}

interface Props {
    presetTabs: RelativeRangeDatepickerPresetTab[];
    onUpdatePreset: (start: string, end: string) => void;
    minValue?: DateTime;

    value?: RelativeRangeDatepickerValue | null;
}

export function RelativeRangeDatePickerPresets(props: Props) {
    const {presetTabs: propsPresetTabs, onUpdatePreset, minValue, value} = props;

    const presetTabs = React.useMemo(() => {
        if (!minValue) return propsPresetTabs;
        return propsPresetTabs
            .map((tab) => {
                const presets = tab.presets.filter((preset) => {
                    const start = dateTimeParse(preset.start, {allowRelative: true});
                    if (!start) return false;
                    return start.valueOf() > minValue?.valueOf();
                });
                return {...tab, presets};
            })
            .filter((tab) => tab.presets.length > 0);
    }, [propsPresetTabs, minValue]);

    const [mobile] = useMobile();

    const [visibleTab, setVisibleTab] = React.useState<RelativeRangeDatepickerPresetTab | null>(
        presetTabs[0] || null,
    );

    function getSelectedPresetIndex() {
        const index = visibleTab?.presets.findIndex((preset) => {
            return preset.start === value?.start?.value && preset.end === value?.end?.value;
        });
        return typeof index === 'number' ? index : undefined;
    }

    if (!presetTabs.length) return null;

    return (
        <div className={b({mobile})}>
            <div className={b('header')}>
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
                <div className={b('hint')}>
                    <RelativeDatePickerPresetsHint />
                </div>
            </div>
            {visibleTab ? (
                <List
                    className={b('list')}
                    itemClassName={b('item', {mobile})}
                    items={visibleTab.presets}
                    selectedItemIndex={getSelectedPresetIndex()}
                    filterable={false}
                    virtualized={false}
                    renderItem={renderPreset}
                    onItemClick={(item: RelativeRangeDatepickerPreset) => {
                        onUpdatePreset(item.start, item.end);
                    }}
                />
            ) : null}
        </div>
    );
}
