import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Sheet, useMobile} from '@gravity-ui/uikit';

import {block} from '../../../../../utils/cn';
import {i18n as i18nEditor} from '../../i18n';

import {i18n} from './i18n';

import './RelativeDatePickerPresetsHint.scss';

export const b = block('relative-range-date-picker-presets-hint');

type Row = {
    title: Parameters<typeof i18n>[0];
    start: string;
    end: string;
};

const rows: Row[] = [
    {title: 'Last-five-min', start: 'now-5m', end: 'now'},
    {title: 'Day-so-far', start: 'now/d', end: 'now'},
    {title: 'This-week', start: 'now/w', end: 'now/w'},
    {title: 'Week-to-date', start: 'now/w', end: 'now'},
    {title: 'Prev-month', start: 'now-1M/M', end: 'now-1M/M'},
];

function renderRow(row: Row) {
    return (
        <React.Fragment key={row.title}>
            <div className={b('cell')}>{i18n(row.title)}</div>
            <div className={b('cell', {value: true})}>{row.start}</div>
            <div className={b('cell', {value: true})}>{row.end}</div>
        </React.Fragment>
    );
}

function renderMobileRow(row: Row) {
    return (
        <div key={row.title} className={b('row')}>
            <div className={b('title')}>{i18n(row.title)}</div>
            <div className={b('preset')}>
                <div className={b('value')}>{row.start}</div>
                <div className={b('value')}>{row.end}</div>
            </div>
        </div>
    );
}

export function RelativeDatePickerPresetsHint() {
    const [mobile] = useMobile();

    function renderContent() {
        if (mobile) {
            return (
                <Sheet visible={true}>
                    <div className={b('mobile-content')}>{rows.map(renderMobileRow)}</div>
                </Sheet>
            );
        }

        return (
            <div className={b('content')}>
                {mobile ? (
                    rows.map(renderMobileRow)
                ) : (
                    <React.Fragment>
                        <div className={b('cell', {header: true})}>{i18n('Range')}</div>
                        <div className={b('cell', {header: true})}>{i18nEditor('From')}</div>
                        <div className={b('cell', {header: true})}>{i18nEditor('To')}</div>
                        {rows.map(renderRow)}
                    </React.Fragment>
                )}
            </div>
        );
    }

    return (
        <HelpPopover
            openOnHover={!mobile}
            className={b()}
            tooltipContentClassName={b('popup', {platform: mobile ? 'mobile' : 'desktop'})}
            placement={['right-start', 'left-start']}
            hasArrow={false}
            content={renderContent()}
        />
    );
}
