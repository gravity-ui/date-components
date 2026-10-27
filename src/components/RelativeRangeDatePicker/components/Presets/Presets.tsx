'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {List, Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';

import type {Preset} from './defaultPresets';
import {i18n} from './i18n';
import {filterPresetTabs, getDefaultPresetTabs} from './utils';
import type {PresetTab} from './utils';

import './Presets.scss';

const b = block('relative-range-date-picker-presets');

interface PresetProps {
    className?: string;
    onChoosePreset: (start: string | null, end: string | null) => void;
    withTime?: boolean;
    minValue?: DateTime;
    size?: 's' | 'm' | 'l' | 'xl';
    presetTabs?: PresetTab[];
    allowNullableValues?: boolean;
}
export function Presets({
    className,
    size = 'm',
    minValue,
    withTime,
    onChoosePreset,
    presetTabs,
    allowNullableValues,
}: PresetProps) {
    const {t} = i18n.useTranslation();
    const tabs = React.useMemo(() => {
        return filterPresetTabs(
            presetTabs ?? getDefaultPresetTabs({withTime, allowNullableValues, t}),
            {minValue, allowNullableValues},
        );
    }, [presetTabs, withTime, allowNullableValues, t, minValue]);

    const [activeTabId, setActiveTab] = React.useState(tabs[0]?.id);

    if (tabs.length === 0) {
        return null;
    }

    const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
    if (!activeTab) {
        return null;
    }

    if (activeTab.id !== activeTabId) {
        setActiveTab(activeTab.id);
    }

    return (
        <div className={b({size}, className)}>
            <TabProvider value={activeTabId} onUpdate={setActiveTab}>
                <div className={b('tabs')}>
                    <TabList size={size === 's' ? 'm' : size}>
                        {tabs.map(({id, title}) => (
                            <Tab key={id} value={id}>
                                {title}
                            </Tab>
                        ))}
                    </TabList>
                </div>
                <TabPanel className={b('content')} value={activeTabId}>
                    <PresetsList
                        key={activeTab.id}
                        aria-label={activeTab.title}
                        presets={activeTab.presets}
                        onChoosePreset={onChoosePreset}
                        size={size}
                    />
                </TabPanel>
            </TabProvider>
        </div>
    );
}
interface PresetsListProps {
    size?: 's' | 'm' | 'l' | 'xl';
    presets: Preset[];
    onChoosePreset: (start: string | null, end: string | null) => void;
    'aria-label': string;
}
function PresetsList({presets, onChoosePreset, size = 'm', ...props}: PresetsListProps) {
    const {t} = i18n.useTranslation();
    // Presets have no ids of their own, and titles are not guaranteed to be unique
    const items = React.useMemo(
        () => presets.map((preset, index) => ({id: String(index), preset})),
        [presets],
    );

    return (
        <List
            aria-label={props['aria-label']}
            className={b('list')}
            items={items}
            size={size}
            getItemContent={({preset}) => t(preset.title as any)}
            onItemAction={(_id, {preset}) => {
                onChoosePreset(preset.from, preset.to);
            }}
        />
    );
}
