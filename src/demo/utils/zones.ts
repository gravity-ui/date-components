import {dateTime, getTimeZonesList} from '@gravity-ui/date-utils';
import type {InputType} from 'storybook/internal/types';

const zones = getTimeZonesList().reduce<Record<string, string>>((l, zone) => {
    // eslint-disable-next-line no-param-reassign
    l[zone] = `${zone} (UTC ${dateTime({timeZone: zone}).format('Z')})`;
    return l;
}, {});

export const timeZoneControl: InputType = {
    options: ['none', ...Object.keys(zones)],
    mapping: {
        none: undefined,
    },
    control: {
        type: 'select',
        labels: zones,
    },
};
