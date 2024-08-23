'use client';

import {getTimeZonesList} from '@gravity-ui/date-utils';
import {ChevronRight} from '@gravity-ui/icons';
import {Button, Icon, Select, Text} from '@gravity-ui/uikit';
import type {SelectOption, SelectOptionGroup} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {getTimeZoneOffset, normalizeTimeZone} from '../../utils';

import {i18n} from './i18n';

import './Zones.scss';

const groups: Record<string, {label: string; options: SelectOption[]}> = {};

const zones = getTimeZonesList().reduce<(SelectOption | SelectOptionGroup)[]>((opts, value) => {
    const [groupName] = value.split('/');
    if (groupName) {
        let group = groups[groupName];
        if (!group) {
            group = {label: groupName, options: []};
            groups[groupName] = group;
            opts.push(group);
        }
        group.options.push({value});
    }
    return opts;
}, []);

zones.unshift({
    value: 'UTC',
});

zones.unshift({
    value: 'system',
    get content() {
        return i18n('system');
    },
});

zones.unshift({
    value: 'default',
    get content() {
        return i18n('default');
    },
});

const b = block('relative-range-date-picker-zones');

export interface ZonesProps {
    value: string;
    onUpdate: (timeZone: string) => void;
    size?: 's' | 'm' | 'l' | 'xl';
    isMobile?: boolean;
    disabled?: boolean;
}

export function Zones(props: ZonesProps) {
    const timeZone = normalizeTimeZone(props.value);
    const size = props.isMobile ? 'xl' : props.size;
    return (
        <Select
            disabled={props.disabled}
            value={[timeZone]}
            options={zones}
            size={size}
            onUpdate={(v) => {
                const tz = v[0];
                if (tz) {
                    props.onUpdate(tz);
                }
            }}
            width="max"
            renderControl={(controlProps) => {
                const value =
                    timeZone === 'system' || timeZone === 'default' ? i18n(timeZone) : timeZone;
                return (
                    <Button
                        onClick={controlProps.onClick}
                        ref={controlProps.ref}
                        view="flat-secondary"
                        width="max"
                        pin="clear-clear"
                        size={size}
                        disabled={props.disabled}
                        extraProps={{
                            'aria-haspopup': 'listbox',
                            'aria-expanded': controlProps.open,
                            onKeyDown: controlProps.onKeyDown,
                        }}
                        className={b('control')}
                    >
                        {`${value} (${getTimeZoneOffset(timeZone)})`}
                        <Icon
                            className={b('control-icon')}
                            data={ChevronRight}
                            size={props.isMobile ? 20 : 16}
                        />
                    </Button>
                );
            }}
            renderOption={({value, content}) => {
                const v = content ?? value;
                return (
                    <span className={b('item')}>
                        <span className={b('item-title')} title={value}>
                            {v}&nbsp;
                        </span>
                        <Text color="secondary">{getTimeZoneOffset(value)}</Text>
                    </span>
                );
            }}
            filterable
        />
    );
}
