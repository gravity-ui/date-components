import {dateTimeParse, guessUserTimeZone} from '@gravity-ui/date-utils';

import {i18n} from '../../../i18n';

export const isStartsLikeRelative = (input = '') => input.startsWith('now');
export const getFormattedRangeItem = (opt: {
    dateFormat: string;
    input?: string;
    timeZone?: string;
    showAsAbsolute?: boolean;
    roundUp?: boolean;
}) => {
    const {input, dateFormat, timeZone, showAsAbsolute, roundUp} = opt;

    return isStartsLikeRelative(input) && !showAsAbsolute
        ? input
        : dateTimeParse(input, {timeZone, roundUp})?.format(dateFormat);
};

export const getFormattedInputValue = ({
    start,
    end,
    dateFormat,
    dateFormatDelimiter,
    timeZone = guessUserTimeZone(),
}: any) => {
    let startItem = '';
    let endItem = '';
    let dash = '';

    if (start) {
        startItem =
            getFormattedRangeItem({
                input: start,
                dateFormat,
                timeZone,
                showAsAbsolute: true,
            }) || '';
    }

    if (end) {
        endItem =
            getFormattedRangeItem({
                input: end,
                dateFormat,
                timeZone,
                showAsAbsolute: true,
                roundUp: true,
            }) || '';
    }

    if (startItem || endItem) {
        dash = ` ${dateFormatDelimiter} `;
    }

    return `${startItem}${dash}${endItem}`;
};

const UNITS_WITH_FEMIMINE_GENDER = ['s', 'm', 'w'];
const RELATIVE_SUBTRACTION_DATE_RE = /^now-[0-9]+[smhdwMy]$/;

export const isRelativeRange = (from?: string, to?: string) => {
    return Boolean(from && to && RELATIVE_SUBTRACTION_DATE_RE.test(from) && to === 'now');
};

export const getRelativeRangeTitle = (from: string) => {
    const count = from.replace(/[^0-9.]/g, '');
    const unit = from.slice(-1);

    const unitLabel = `label_${unit}`;
    const lastPartI18nKey = UNITS_WITH_FEMIMINE_GENDER.includes(unit)
        ? 'label_last-f'
        : 'label_last';

    const lastPart = i18n(lastPartI18nKey, {count});
    //@ts-ignore
    const unitPart = i18n(unitLabel, {count});
    const countPart = count.replace(/^1$/, '');
    const valuePart = countPart ? `${countPart} ${unitPart}` : unitPart;

    return `${lastPart} ${valuePart}`;
};
