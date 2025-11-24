'use client';

import React from 'react';

import {CircleQuestion} from '@gravity-ui/icons';
import {Button, Icon, Popover, Sheet, Table, useMobile} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {getButtonSizeForInput} from '../../../utils/getButtonSizeForInput';
import type {DefaultPreset, Preset} from '../Presets/defaultPresets';
import {i18n} from '../Presets/i18n';

import './PickerDoc.scss';

const b = block('relative-range-date-picker-doc');

const data: DefaultPreset[] = [
    {
        title: 'Last 5 minutes',
        from: 'now - 5m',
        to: 'now',
    },
    {
        title: 'From start of day',
        from: 'now/d',
        to: 'now',
    },
    {
        title: 'This week',
        from: 'now/w',
        to: 'now/w',
    },
    {
        title: 'From start of week',
        from: 'now/w',
        to: 'now',
    },
    {
        title: 'Previous month',
        from: 'now - 1M/M',
        to: 'now - 1M/M',
    },
];

interface DocContentProps extends Omit<PresetsDocProps, 'docs' | 'className'> {
    docs: Preset[];
}

function DocContent({size, docs, onStartUpdate, onEndUpdate}: DocContentProps) {
    const isMobile = useMobile();

    const {t} = i18n.useTranslation();
    const columns: TableColumnConfig<Preset>[] = React.useMemo(
        () => [
            {
                id: 'title',
                name: () => {
                    return t('Range');
                },
                template: (item) => {
                    return t(item.title as any);
                },
            },
            {
                id: 'from',
                name: () => {
                    return t('From');
                },
                template: (item) => (
                    <Button
                        size={isMobile ? 'l' : getButtonSizeForInput(size)}
                        onClick={() => onStartUpdate(item.from)}
                    >
                        {item.from}
                    </Button>
                ),
            },
            {
                id: 'to',
                name: () => {
                    return t('To');
                },
                template: (item) => (
                    <Button
                        size={isMobile ? 'l' : getButtonSizeForInput(size)}
                        onClick={() => onEndUpdate(item.to)}
                    >
                        {item.to}
                    </Button>
                ),
            },
        ],
        [isMobile, onEndUpdate, onStartUpdate, size, t],
    );

    return <Table columns={columns} data={docs} className={b('table', {size})} wordWrap />;
}

interface DesktopDocProps extends Omit<PresetsDocProps, 'docs'> {
    docs: Preset[];
}

function DesktopDoc({className, size, ...props}: DesktopDocProps) {
    return (
        <Popover
            className={b(null)}
            hasArrow={false}
            placement={['right-start', 'left-start']}
            content={<DocContent size={size} {...props} />}
        >
            <Button
                className={b('button', className)}
                view="flat-secondary"
                size={getButtonSizeForInput(size)}
            >
                <Icon data={CircleQuestion} />
            </Button>
        </Popover>
    );
}

interface MobileDocProps extends Omit<PresetsDocProps, 'docs'> {
    docs: Preset[];
}

function MobileDoc({className, ...props}: MobileDocProps) {
    const [open, setOpen] = React.useState(false);
    return (
        <div className={b(null, className)}>
            <Button
                className={b('button')}
                view="flat-secondary"
                size="l"
                onClick={() => {
                    setOpen(true);
                }}
            >
                <Icon data={CircleQuestion} />
            </Button>
            <Sheet visible={open} onClose={() => setOpen(false)}>
                <DocContent {...props} />
            </Sheet>
        </div>
    );
}

interface PresetsDocProps {
    className?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    docs?: Preset[];
    onStartUpdate: (start: string) => void;
    onEndUpdate: (end: string) => void;
}

export function PickerDoc({docs = data, ...props}: PresetsDocProps) {
    const isMobile = useMobile();

    if (!Array.isArray(docs) || docs.length === 0) {
        return null;
    }

    if (isMobile) {
        return <MobileDoc {...props} docs={docs} />;
    }

    return <DesktopDoc {...props} docs={docs} />;
}
