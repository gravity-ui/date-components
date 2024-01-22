import type {DateTime} from '@gravity-ui/date-utils';

import type {DateFieldSectionWithoutPosition} from '../../DateField/types';
import {
    EDITABLE_SEGMENTS,
    getEditableSections,
    isEditableSection,
    toEditableSection,
} from '../../DateField/utils';
import type {RangeValue} from '../../types';

export function getRangeEditableSections(
    sections: DateFieldSectionWithoutPosition[],
    value: RangeValue<DateTime>,
    validSegments: RangeValue<typeof EDITABLE_SEGMENTS>,
    delimeter: string,
) {
    const start = getEditableSections(sections, value.start, validSegments.start);
    const end = getEditableSections(sections, value.end, validSegments.end);

    const last = start[start.length - 1];
    let position = last.end;
    const previousEditableSection = last.nextEditableSection;
    const sectionsCount = start.length + 1;

    const delimeterSection = toEditableSection(
        {
            type: 'literal',
            contentType: 'letter',
            format: delimeter,
            placeholder: delimeter,
            hasLeadingZeros: false,
        },
        value.start,
        validSegments.start,
        position,
        previousEditableSection,
    );

    position += delimeterSection.textValue.length - 1;

    let nextEditableSection;
    for (let index = 0; index < end.length; index++) {
        const section = end[index];

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
        delimeterSection.nextEditableSection = nextEditableSection;

        start[previousEditableSection].nextEditableSection = nextEditableSection;
    }

    return [...start, delimeterSection, ...end];
}
