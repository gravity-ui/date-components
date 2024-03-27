import React from 'react';

import {dateTime, isValid, settings} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {mergeDateTime} from '../utils/dates';

import {i18n} from './i18n';
import type {
    DateFieldSection,
    DateFieldSectionType,
    DateFieldSectionWithoutPosition,
    DateFormatTokenMap,
} from './types';

export const EDITABLE_SEGMENTS: Partial<Record<DateFieldSectionType, boolean>> = {
    year: true,
    month: true,
    day: true,
    hour: true,
    minute: true,
    second: true,
    dayPeriod: true,
    weekday: true,
};

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
        // eslint-disable-next-line no-console
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

function isHour12(format: string) {
    return dateTime().set('hour', 15).format(format) !== '15';
}

export function getSectionLimits(section: DateFieldSectionWithoutPosition, date: DateTime) {
    const {type, format} = section;
    switch (type) {
        case 'year': {
            const isFourDigit = isFourDigitYearFormat(format);
            return {
                minValue: isFourDigit ? 1 : 0,
                maxValue: isFourDigit ? 9999 : 99,
            };
        }
        case 'month': {
            return {
                minValue: 0,
                maxValue: 11,
            };
        }
        case 'weekday': {
            return {
                minValue: 0,
                maxValue: 6,
            };
        }
        case 'day': {
            return {
                minValue: 1,
                maxValue: date ? date.daysInMonth() : 31,
            };
        }
        case 'hour': {
            if (isHour12(format)) {
                const isPM = date.hour() >= 12;
                return {
                    minValue: isPM ? 12 : 0,
                    maxValue: isPM ? 23 : 11,
                };
            }
            return {
                minValue: 0,
                maxValue: 23,
            };
        }
        case 'minute':
        case 'second': {
            return {
                minValue: 0,
                maxValue: 59,
            };
        }
    }
    return {};
}

export function getSectionValue(sections: DateFieldSectionWithoutPosition, date: DateTime) {
    const type = sections.type;
    switch (type) {
        case 'year': {
            return isFourDigitYearFormat(sections.format)
                ? date.year()
                : Number(date.format(sections.format));
        }
        case 'month':
        case 'hour':
        case 'minute':
        case 'second': {
            return date[type]();
        }
        case 'day': {
            return date.date();
        }
        case 'weekday': {
            return date.day();
        }
        case 'dayPeriod': {
            return date.hour() >= 12 ? 12 : 0;
        }
    }
    return undefined;
}

const TYPE_MAPPING = {
    weekday: 'day',
    day: 'date',
    dayPeriod: 'hour',
} as const;

export function getDurationUnitFromSectionType(type: DateFieldSectionType) {
    if (type === 'literal' || type === 'timeZoneName' || type === 'unknown') {
        throw new Error(`${type} section does not have duration unit.`);
    }

    if (type in TYPE_MAPPING) {
        return TYPE_MAPPING[type as keyof typeof TYPE_MAPPING];
    }

    return type as Exclude<
        DateFieldSectionType,
        keyof typeof TYPE_MAPPING | 'literal' | 'timeZoneName' | 'unknown'
    >;
}

export function addSegment(section: DateFieldSection, date: DateTime, amount: number) {
    let val = section.value ?? 0;
    if (section.type === 'dayPeriod') {
        val = date.hour() + (date.hour() > 12 ? -12 : 12);
    } else {
        val = val + amount;
        const min = section.minValue;
        const max = section.maxValue;
        if (typeof min === 'number' && typeof max === 'number') {
            const length = max - min + 1;
            val = ((val - min + length) % length) + min;
        }
    }

    if (section.type === 'year' && !isFourDigitYearFormat(section.format)) {
        val = dateTime({input: `${val}`.padStart(2, '0'), format: section.format}).year();
    }

    const type = getDurationUnitFromSectionType(section.type);
    return date.set(type, val);
}

export function setSegment(section: DateFieldSection, date: DateTime, amount: number) {
    const type = section.type;
    switch (type) {
        case 'year': {
            return date.set(
                'year',
                isFourDigitYearFormat(section.format)
                    ? amount
                    : dateTime({
                          input: `${amount}`.padStart(2, '0'),
                          format: section.format,
                      }).year(),
            );
        }
        case 'day':
        case 'weekday':
        case 'month': {
            return date.set(getDurationUnitFromSectionType(type), amount);
        }
        case 'dayPeriod': {
            const hours = date.hour();
            const wasPM = hours >= 12;
            const isPM = amount >= 12;
            if (isPM === wasPM) {
                return date;
            }
            return date.set('hour', wasPM ? hours - 12 : hours + 12);
        }
        case 'hour': {
            // In 12 hour time, ensure that AM/PM does not change
            let sectionAmount = amount;
            if (section.minValue === 12 || section.maxValue === 11) {
                const hours = date.hour();
                const wasPM = hours >= 12;
                if (!wasPM && sectionAmount === 12) {
                    sectionAmount = 0;
                }
                if (wasPM && sectionAmount < 12) {
                    sectionAmount += 12;
                }
            }
            return date.set('hour', sectionAmount);
        }
        case 'minute':
        case 'second': {
            return date.set(type, amount);
        }
    }

    return date;
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
            return i18n('weekday_placeholder').repeat(
                sectionConfig.contentType === 'letter' ? 4 : 2,
            );
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
        const char = expandedFormat[i] || '';
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
        options: getSectionOptions(sectionConfig, token),
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

function getSectionOptions(
    section: Pick<DateFieldSectionWithoutPosition, 'type' | 'contentType'>,
    token: string,
) {
    switch (section.type) {
        case 'month': {
            const format = section.contentType === 'letter' ? token : 'MMMM';
            let date = dateTime().startOf('year');
            const options: string[] = [];
            for (let i = 0; i < 12; i++) {
                options.push(date.format(format).toLocaleUpperCase());
                date = date.add(1, 'months');
            }
            return options;
        }
        case 'dayPeriod': {
            const amDayPeriod = dateTime().hour(0);
            const pmDayPeriod = amDayPeriod.hour(12);
            const options = [
                amDayPeriod.format(token).toLocaleUpperCase(),
                pmDayPeriod.format(token).toLocaleUpperCase(),
            ];
            return options;
        }
        case 'weekday': {
            const format = section.contentType === 'letter' ? token : 'dddd';
            let date = dateTime().day(0);
            const options: string[] = [];
            for (let i = 0; i < 7; i++) {
                options.push(date.format(format).toLocaleUpperCase());
                date = date.add(1, 'day');
            }
            return options;
        }
    }

    return undefined;
}

export function cleanString(dirtyString: string) {
    return dirtyString.replace(/[\u2066\u2067\u2068\u2069]/g, '');
}

export function getEditableSections(
    sections: DateFieldSectionWithoutPosition[],
    value: DateTime,
    validSegments: typeof EDITABLE_SEGMENTS,
) {
    let position = 1;
    const newSections: DateFieldSection[] = [];
    let previousEditableSection = -1;
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section) {
            continue;
        }

        const newSection = toEditableSection(
            section,
            value,
            validSegments,
            position,
            previousEditableSection,
        );

        newSections.push(newSection);

        if (isEditableSection(section)) {
            for (let j = Math.max(0, previousEditableSection); j <= i; j++) {
                const prevSection = newSections[j];
                if (prevSection) {
                    prevSection.nextEditableSection = i;
                    if (prevSection.previousEditableSection === -1) {
                        prevSection.previousEditableSection = i;
                    }
                }
            }
            previousEditableSection = i;
        }

        position += newSection.textValue.length;
    }

    return newSections;
}

export function isEditableSection(section: DateFieldSectionWithoutPosition): boolean {
    return EDITABLE_SEGMENTS[section.type] ?? false;
}

export function toEditableSection(
    section: DateFieldSectionWithoutPosition,
    value: DateTime,
    validSegments: typeof EDITABLE_SEGMENTS,
    position: number,
    previousEditableSection: number,
): DateFieldSection {
    const isEditable = isEditableSection(section);
    let renderedValue = section.placeholder;
    if ((isEditable && validSegments[section.type]) || section.type === 'timeZoneName') {
        renderedValue = value.format(section.format);
        if (section.contentType === 'digit' && renderedValue.length < section.placeholder.length) {
            renderedValue = renderedValue.padStart(section.placeholder.length, '0');
        }
    }

    // use bidirectional context to allow the browser autodetect text direction
    renderedValue = '\u2068' + renderedValue + '\u2069';

    const sectionLength = renderedValue.length;

    const newSection = {
        ...section,
        value: getSectionValue(section, value),
        textValue: renderedValue,
        start: position,
        end: position + sectionLength,
        modified: false,
        previousEditableSection,
        nextEditableSection: previousEditableSection,
        ...getSectionLimits(section, value),
    };

    return newSection;
}

export function getCurrentEditableSectionIndex(
    sections: DateFieldSection[],
    selectedSections: 'all' | number,
) {
    const currentIndex =
        selectedSections === 'all' || selectedSections === -1 ? 0 : selectedSections;
    const section = sections[currentIndex];
    if (section && !EDITABLE_SEGMENTS[section.type]) {
        return section.nextEditableSection;
    }
    return section ? currentIndex : -1;
}

export function formatSections(sections: DateFieldSection[]): string {
    // use ltr direction context to get predictable navigation inside input
    return '\u2066' + sections.map((s) => s.textValue).join('') + '\u2069';
}

function parseDate(options: {input: string; format: string; timeZone?: string}) {
    let date = dateTime(options);
    if (!isValid(date)) {
        date = dateTime({...options, format: undefined});
    }
    return date;
}

function isDateStringWithTimeZone(str: string) {
    return /z$/i.test(str) || /[+-]\d\d:\d\d$/.test(str);
}

export function parseDateFromString(str: string, format: string, timeZone?: string): DateTime {
    let date = parseDate({input: str, format, timeZone});
    if (isValid(date)) {
        if (timeZone && !isDateStringWithTimeZone(str)) {
            const time = parseDate({input: str, format});
            date = mergeDateTime(date, time);
        }
    }

    return date;
}

export function isAllSegmentsValid(
    allSegments: typeof EDITABLE_SEGMENTS,
    validSegments: typeof EDITABLE_SEGMENTS,
) {
    return Object.keys(allSegments).every(
        (key) => validSegments[key as keyof typeof EDITABLE_SEGMENTS],
    );
}

export function useFormatSections(format: string) {
    const usedFormat = format;
    const [sections, setSections] = React.useState(() => splitFormatIntoSections(usedFormat));

    const [previousFormat, setFormat] = React.useState(usedFormat);
    if (usedFormat !== previousFormat) {
        setFormat(usedFormat);
        setSections(splitFormatIntoSections(usedFormat));
    }

    return sections;
}
