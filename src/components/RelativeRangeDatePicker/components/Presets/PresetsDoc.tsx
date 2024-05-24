'use client';

import React from 'react';

import {CircleQuestion} from '@gravity-ui/icons';
import {Button, Icon, Popover, Sheet, Table, useMobile} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {getButtonSizeForInput} from '../../../utils/getButtonSizeForInput';

import type {Preset} from './defaultPresets';
import {i18n} from './i18n';

import './PresetsDoc.scss';

const b = block('relative-range-date-picker-presets-doc');

const columns: TableColumnConfig<Preset>[] = [
    {
        id: 'title',
        name: () => {
            return i18n('Range');
        },
    },
    {
        id: 'from',
        name: () => {
            return i18n('From');
        },
    },
    {
        id: 'to',
        name: () => {
            return i18n('To');
        },
    },
];

const data: Preset[] = [
    {
        get title() {
            return i18n('Last 5 minutes');
        },
        from: 'now - 5m',
        to: 'now',
    },
    {
        get title() {
            return i18n('From start of day');
        },
        from: 'now/d',
        to: 'now',
    },
    {
        get title() {
            return i18n('This week');
        },
        from: 'now/w',
        to: 'now/w',
    },
    {
        get title() {
            return i18n('From start of week');
        },
        from: 'now/w',
        to: 'now',
    },
    {
        get title() {
            return i18n('Previous month');
        },
        from: 'now - 1M/M',
        to: 'now - 1M/M',
    },
];

interface PresetsExamplesProps {
    size?: 's' | 'm' | 'l' | 'xl';
    docs: Preset[];
}
function PresetsExamples({size, docs}: PresetsExamplesProps) {
    return <Table columns={columns} data={docs} className={b('table', {size})} />;
}

interface DesktopDocProps {
    className?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    docs: Preset[];
}
function DesktopDoc({className, size, docs}: DesktopDocProps) {
    return (
        <Popover
            className={b(null, className)}
            tooltipContentClassName={b('content')}
            hasArrow={false}
            content={<PresetsExamples size={size} docs={docs} />}
        >
            <Button
                className={b('button')}
                view="flat-secondary"
                size={getButtonSizeForInput(size)}
            >
                <Icon data={CircleQuestion} />
            </Button>
        </Popover>
    );
}

interface MobileDocProps {
    className?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    docs: Preset[];
}
function MobileDoc({className, size, docs}: MobileDocProps) {
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
                <PresetsExamples size={size} docs={docs} />
            </Sheet>
        </div>
    );
}

interface PresetsDocProps {
    className?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    docs?: Preset[];
}

export function PresetsDoc({className, size, docs = data}: PresetsDocProps) {
    const isMobile = useMobile();

    if (!Array.isArray(docs) || docs.length === 0) {
        return null;
    }

    if (isMobile) {
        return <MobileDoc className={className} size={size} docs={docs} />;
    }

    return <DesktopDoc className={className} size={size} docs={docs} />;
}
