import {dateTime, settings} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {i18n} from './i18n';
import type {
    DateFieldSection,
    DateFieldSectionType,
    DateFieldSectionWithoutPosition,
    DateFormatTokenMap,
} from './types';

export const isMac = window.navigator.userAgent.indexOf('Macintosh') >= 0;
export const CtrlCmd = isMac ? 'metaKey' : 'ctrlKey';

export function expandFormat(format: string) {
    const localeFormats = settings.getLocaleData().formats;

    const getShortLocalizedFormatFromLongLocalizedFormat = (formatBis: string) =>
        formatBis.replace(
            /(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,
            (_: string, escapeSequence: string, localizedFormat: string) =>
                escapeSequence || localizedFormat.slice(1),
        );

    return format.replace(
        /(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,
        (_: string, escapeSequence: string, localizedFormat: string) => {
            const LongLocalizedFormat = localizedFormat && localizedFormat.toUpperCase();
            return (
                escapeSequence ||
                localeFormats[localizedFormat as keyof typeof localeFormats] ||
                getShortLocalizedFormatFromLongLocalizedFormat(
                    localeFormats[LongLocalizedFormat as keyof typeof localeFormats] as string,
                )
            );
        },
    );
}

const escapedCharacters = {start: '[', end: ']'};

const formatTokenMap: DateFormatTokenMap = {
    // Year
    YY: 'year',
    YYYY: 'year',

    // Month
    M: 'month',
    MM: 'month',
    MMM: {sectionType: 'month', contentType: 'letter'},
    MMMM: {sectionType: 'month', contentType: 'letter'},

    // Day of the month
    D: 'day',
    DD: 'day',
    Do: 'day',

    // Day of the week
    d: 'weekday',
    dd: {sectionType: 'weekday', contentType: 'letter'},
    ddd: {sectionType: 'weekday', contentType: 'letter'},
    dddd: {sectionType: 'weekday', contentType: 'letter'},

    // Day period AM, PM
    A: {sectionType: 'dayPeriod', contentType: 'letter'},
    a: {sectionType: 'dayPeriod', contentType: 'letter'},

    // Hours
    H: 'hour',
    HH: 'hour',
    h: 'hour',
    hh: 'hour',

    // Minutes
    m: 'minute',
    mm: 'minute',

    // Seconds
    s: 'second',
    ss: 'second',

    // Timezone
    z: {sectionType: 'timeZoneName', contentType: 'letter'},
    zzz: {sectionType: 'timeZoneName', contentType: 'letter'},
    Z: {sectionType: 'timeZoneName', contentType: 'letter'},
    ZZ: {sectionType: 'timeZoneName', contentType: 'letter'},
};

function getDateSectionConfigFromFormatToken(formatToken: string): {
    type: DateFieldSectionType;
    contentType: 'letter' | 'digit';
} {
    const config = formatTokenMap[formatToken];

    if (!config) {
        console.error(
            [
                `The token "${formatToken}" is not supported by the Date field.`,
                'Please try using another token.',
            ].join('\n'),
        );
        return {
            type: 'literal',
            contentType: 'letter',
        };
    }

    if (typeof config === 'string') {
        return {
            type: config,
            contentType: 'digit',
        };
    }

    return {
        type: config.sectionType,
        contentType: config.contentType,
    };
}

function isFourDigitYearFormat(format: string) {
    return dateTime().format(format).length === 4;
}
function doesSectionHaveLeadingZeros(
    contentType: 'digit' | 'letter',
    sectionType: DateFieldSectionType,
    format: string,
) {
    if (contentType !== 'digit') {
        return false;
    }

    switch (sectionType) {
        case 'year': {
            if (isFourDigitYearFormat(format)) {
                const formatted0001 = dateTime().set('year', 1).format(format);
                return formatted0001 === '0001';
            }

            const formatted2001 = dateTime().set('year', 2001).format(format);
            return formatted2001 === '01';
        }

        case 'month': {
            return dateTime().startOf('year').format(format).length > 1;
        }

        case 'day': {
            return dateTime().startOf('month').format(format).length > 1;
        }

        case 'weekday': {
            return dateTime().startOf('week').format(format).length > 1;
        }

        case 'hour': {
            return dateTime().set('hour', 1).format(format).length > 1;
        }

        case 'minute': {
            return dateTime().set('minute', 1).format(format).length > 1;
        }

        case 'second': {
            return dateTime().set('second', 1).format(format).length > 1;
        }

        default: {
            throw new Error('Invalid section type');
        }
    }
}

function getSectionPlaceholder(
    sectionConfig: Pick<DateFieldSection, 'type' | 'contentType'>,
    currentTokenValue: string,
) {
    switch (sectionConfig.type) {
        case 'year': {
            return i18n('year_placeholder').repeat(dateTime().format(currentTokenValue).length);
        }

        case 'month': {
            return i18n('month_placeholder').repeat(sectionConfig.contentType === 'letter' ? 4 : 2);
        }

        case 'day': {
            return i18n('day_placeholder').repeat(2);
        }

        case 'weekday': {
            return i18n('weekday_placeholder');
        }

        case 'hour': {
            return i18n('hour_placeholder').repeat(2);
        }

        case 'minute': {
            return i18n('minute_placeholder').repeat(2);
        }

        case 'second': {
            return i18n('second_placeholder').repeat(2);
        }

        case 'dayPeriod': {
            return i18n('dayPeriod_placeholder');
        }

        default: {
            return currentTokenValue;
        }
    }
}

export function splitFormatIntoSections(format: string) {
    const sections: DateFieldSectionWithoutPosition[] = [];

    const expandedFormat = expandFormat(format);

    let currentTokenValue = '';
    let isSeparator = false;
    let isInEscapeBoundary = false;
    for (let i = 0; i < expandedFormat.length; i++) {
        const char = expandedFormat[i];
        if (isInEscapeBoundary) {
            if (char === escapedCharacters.end) {
                isInEscapeBoundary = false;
                continue;
            }
            currentTokenValue += char;
        } else if (char.match(/[a-zA-Z]/)) {
            if (isSeparator) {
                addLiteralSection(sections, currentTokenValue);
                currentTokenValue = '';
            }
            isSeparator = false;
            currentTokenValue += char;
        } else {
            if (!isSeparator) {
                addFormatSection(sections, currentTokenValue);
                currentTokenValue = '';
            }
            isSeparator = true;
            if (char === escapedCharacters.start) {
                isInEscapeBoundary = true;
            } else {
                currentTokenValue += char;
            }
        }
    }
    if (currentTokenValue) {
        if (isSeparator) {
            addLiteralSection(sections, currentTokenValue);
        } else {
            addFormatSection(sections, currentTokenValue);
        }
    }

    return sections;
}

function addFormatSection(sections: DateFieldSectionWithoutPosition[], token: string) {
    if (!token) {
        return;
    }

    const sectionConfig = getDateSectionConfigFromFormatToken(token);

    const hasLeadingZeros = doesSectionHaveLeadingZeros(
        sectionConfig.contentType,
        sectionConfig.type,
        token,
    );

    sections.push({
        ...sectionConfig,
        format: token,
        placeholder: getSectionPlaceholder(sectionConfig, token),
        hasLeadingZeros,
    });
}

function addLiteralSection(sections: DateFieldSectionWithoutPosition[], token: string) {
    if (!token) {
        return;
    }

    sections.push({
        type: 'literal',
        contentType: 'letter',
        format: token,
        placeholder: token,
        hasLeadingZeros: false,
    });
}

interface PlaceholderValueOptions {
    placeholderValue?: DateTime;
    timeZone?: string;
}
export function createPlaceholderValue({placeholderValue, timeZone}: PlaceholderValueOptions) {
    return (
        placeholderValue ?? dateTime({timeZone}).set('hour', 0).set('minute', 0).set('second', 0)
    );
}

export function isInvalid(
    value: DateTime | null | undefined,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    if (!value) {
        return false;
    }

    if (minValue && value.isBefore(minValue)) {
        return true;
    }
    if (maxValue && maxValue.isBefore(value)) {
        return true;
    }

    return false;
}
