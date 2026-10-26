'use client';

import React from 'react';

import {CircleQuestion} from '@gravity-ui/icons';
import {Button, Icon, Popover, Sheet, useMobile} from '@gravity-ui/uikit';

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

function DocContent({size, docs, onStartUpdate, onEndUpdate, onRangeUpdate}: DocContentProps) {
    const {t} = i18n.useTranslation();
    const buttonSize = getButtonSizeForInput(size);

    return (
        <div className={b('table-wrapper')}>
            <table className={b('table', {size})}>
                <thead>
                    <tr>
                        <th className={b('cell')}>{t('Range')}</th>
                        <th className={b('cell')}>{t('From')}</th>
                        <th className={b('cell')}>{t('To')}</th>
                    </tr>
                </thead>
                <tbody>
                    {docs.map((item, index) => (
                        <tr key={index} className={b('row')}>
                            <td className={b('cell')}>
                                <Button
                                    view="flat"
                                    size={buttonSize}
                                    onClick={() => {
                                        onRangeUpdate(item.from, item.to);
                                    }}
                                >
                                    {t(item.title as any)}
                                </Button>
                            </td>
                            <td className={b('cell')}>
                                <Button
                                    view="flat"
                                    size={buttonSize}
                                    onClick={() => {
                                        onStartUpdate(item.from);
                                    }}
                                >
                                    {item.from}
                                </Button>
                            </td>
                            <td className={b('cell')}>
                                <Button
                                    view="flat"
                                    size={buttonSize}
                                    onClick={() => {
                                        onEndUpdate(item.to);
                                    }}
                                >
                                    {item.to}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface DesktopDocProps extends Omit<PresetsDocProps, 'docs'> {
    docs: Preset[];
}

function DesktopDoc({className, size, ...props}: DesktopDocProps) {
    return (
        <Popover
            className={b()}
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
            <Sheet open={open} onOpenChange={setOpen}>
                <DocContent {...props} />
            </Sheet>
        </div>
    );
}

interface PresetsDocProps {
    className?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    docs?: Preset[];
    onStartUpdate: (start: string | null) => void;
    onEndUpdate: (end: string | null) => void;
    onRangeUpdate: (start: string | null, end: string | null) => void;
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
