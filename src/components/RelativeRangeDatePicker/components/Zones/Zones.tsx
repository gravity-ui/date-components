'use client';

import {getTimeZonesList} from '@gravity-ui/date-utils';
import {ChevronRight} from '@gravity-ui/icons';
import {Button, Icon, Select, Text} from '@gravity-ui/uikit';
import type {SelectOptionGroupProps, SelectOptionProps} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {getTimeZoneOffset, normalizeTimeZone} from '../../utils';

import {i18n} from './i18n';

import './Zones.scss';

const groups: Record<string, {label: string; options: SelectOptionProps[]}> = {};

const zones = getTimeZonesList().reduce<(SelectOptionProps | SelectOptionGroupProps)[]>(
    (opts, value) => {
        const [groupName] = value.split('/');
        // UTC is added at the top of the list, and option values have to be unique
        if (groupName && value !== 'UTC') {
            let group = groups[groupName];
            if (!group) {
                group = {label: groupName, options: []};
                groups[groupName] = group;
                opts.push(group);
            }
            group.options.push({value});
        }
        return opts;
    },
    [],
);

zones.unshift({
    value: 'UTC',
});

zones.unshift({
    value: 'system',
});

zones.unshift({
    value: 'default',
});

const b = block('relative-range-date-picker-zones');

interface ZonesProps {
    value: string;
    onUpdate: (timeZone: string) => void;
    size?: 's' | 'm' | 'l' | 'xl';
    disabled?: boolean;
}

export function Zones(props: ZonesProps) {
    const timeZone = normalizeTimeZone(props.value);
    const {t} = i18n.useTranslation();
    return (
        <Select
            disabled={props.disabled}
            value={[timeZone]}
            options={zones}
            size={props.size}
            onUpdate={(v) => {
                const tz = v[0];
                if (tz) {
                    props.onUpdate(tz);
                }
            }}
            width="max"
            renderControl={(controlProps) => {
                const value =
                    timeZone === 'system' || timeZone === 'default' ? t(timeZone) : timeZone;
                return (
                    <Button
                        {...controlProps.triggerProps}
                        ref={controlProps.ref as React.Ref<HTMLButtonElement>}
                        view="flat-secondary"
                        width="max"
                        pin="clear-clear"
                        size={props.size}
                        className={b('control')}
                    >
                        {`${value} (${getTimeZoneOffset(timeZone)})`}
                        <Icon
                            className={b('control-icon')}
                            data={ChevronRight}
                            size={props.size === 'xl' ? 20 : 16}
                        />
                    </Button>
                );
            }}
            renderOption={({value, content}) => {
                const v = content ?? value;
                return (
                    <span className={b('item')}>
                        <span className={b('item-title')} title={value}>
                            {value === 'system' || value === 'default' ? t(value) : v}&nbsp;
                        </span>
                        <Text color="secondary">{getTimeZoneOffset(value)}</Text>
                    </span>
                );
            }}
            filterable
        />
    );
}
