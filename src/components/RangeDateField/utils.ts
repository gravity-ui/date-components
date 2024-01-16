import type {DateTime} from '@gravity-ui/date-utils';

import type {DateFieldSection, DateFieldSectionWithoutPosition} from '../DateField/types';
import {
    EDITABLE_SEGMENTS,
    getEditableSections,
    isEditableSection,
    toEditableSection,
} from '../DateField/utils';
import type {RangeValue} from '../types';

export function toRangeFormat(format: string, delimeter: string) {
    return `${format}${delimeter}${format}`;
}

export function splitToRangeSections<T extends DateFieldSectionWithoutPosition>(
    sections: T[],
    delimeter: string,
): RangeValue<T[]> & {delimeter: T} {
    const start: T[] = [];
    const end: T[] = [];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let delimeterSection: T = undefined!;
    for (const section of sections) {
        if (section.type === 'literal' && section.placeholder === delimeter) {
            delimeterSection = section;
            continue;
        }

        const list = delimeterSection === undefined ? start : end;
        list.push(section);
    }

    return {start, end, delimeter: delimeterSection};
}

export function findDelimeterSectionIndex(
    sections: DateFieldSectionWithoutPosition[],
    delimeter: string,
) {
    return sections.findIndex(
        (section) => section.type === 'literal' && section.placeholder === delimeter,
    );
}

export function getRangeEditableSections(
    sections: DateFieldSectionWithoutPosition[],
    value: RangeValue<DateTime>,
    validSegments: RangeValue<typeof EDITABLE_SEGMENTS>,
    delimeter: string,
) {
    const {start, end, delimeter: delimeterSection} = splitToRangeSections(sections, delimeter);
    const startSections = getEditableSections(start, value.start, validSegments.start);
    const endSections = getEditableSections(end, value.end, validSegments.end);

    const last = startSections[startSections.length - 1];
    let position = last.end;
    const previousEditableSection = last.nextEditableSection;
    const sectionsCount = startSections.length + 1;

    const eDelimeterSection = toEditableSection(
        delimeterSection,
        value.start,
        validSegments.start,
        position,
        previousEditableSection,
    );

    position += eDelimeterSection.textValue.length;

    let nextEditableSection;
    for (let index = 0; index < endSections.length; index++) {
        const section = endSections[index];

        section.start += position;
        section.end += position;

        if (section.previousEditableSection === 0 && nextEditableSection === undefined) {
            section.previousEditableSection = previousEditableSection;
        } else {
            section.previousEditableSection += sectionsCount;
        }

        section.nextEditableSection += sectionsCount;

        if (isEditableSection(section) && nextEditableSection === undefined) {
            nextEditableSection = index + sectionsCount;
        }
    }

    if (nextEditableSection !== undefined) {
        eDelimeterSection.nextEditableSection = nextEditableSection;

        startSections[previousEditableSection].nextEditableSection = nextEditableSection;
    }

    return [...startSections, eDelimeterSection, ...endSections];
}

export function formatSections(sections: DateFieldSection[]): string {
    // use ltr direction context to get predictable navigation inside input
    return '\u2066' + sections.map((s) => s.textValue).join('') + '\u2069';
}
