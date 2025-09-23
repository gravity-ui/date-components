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

export interface PresetProps {
    className?: string;
    onChoosePreset: (start: string, end: string) => void;
    withTime?: boolean;
    minValue?: DateTime;
    size?: 's' | 'm' | 'l' | 'xl';
    presetTabs?: PresetTab[];
}
export function Presets({
    className,
    size = 'm',
    minValue,
    withTime,
    onChoosePreset,
    presetTabs,
}: PresetProps) {
    const {t} = i18n.useTranslation();
    const tabs = React.useMemo(() => {
        return filterPresetTabs(presetTabs ?? getDefaultPresetTabs({withTime, t}), {minValue});
    }, [withTime, minValue, presetTabs, t]);

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
                        presets={activeTab.presets}
                        onChoosePreset={onChoosePreset}
                        size={size}
                    />
                </TabPanel>
            </TabProvider>
        </div>
    );
}
export const SIZE_TO_ITEM_HEIGHT = {
    s: 28,
    m: 28,
    l: 32,
    xl: 36,
};

interface PresetsListProps {
    size?: 's' | 'm' | 'l' | 'xl';
    presets: Preset[];
    onChoosePreset: (start: string, end: string) => void;
}
function PresetsList({presets, onChoosePreset, size = 'm'}: PresetsListProps) {
    const ref = React.useRef<List<Preset>>(null);

    React.useEffect(() => {
        const list = ref.current;
        const container = ref.current?.refContainer.current?.node as HTMLDivElement | undefined;
        if (list && container) {
            try {
                container.setAttribute('tabindex', '0');
                container.setAttribute('class', b('list-container'));
                const handleFocus = () => {
                    if (list.getActiveItem() === null) {
                        list.activateItem(0, true);
                    }
                };
                container.addEventListener('focus', handleFocus);
                return () => {
                    container.removeEventListener('focus', handleFocus);
                };
            } catch {
                // Oooops
            }
        }
        return undefined;
    }, []);

    return (
        <List
            ref={ref}
            className={b('list')}
            itemClassName={b('item')}
            items={presets}
            filterable={false}
            virtualized={false}
            renderItem={(item) => item.title}
            itemHeight={SIZE_TO_ITEM_HEIGHT[size]}
            onItemClick={(item) => {
                onChoosePreset(item.from, item.to);
            }}
        />
    );
}
