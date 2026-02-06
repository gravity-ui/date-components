import type {DateTime} from '@gravity-ui/date-utils';

import type {IncompleteDate} from '../../DateField/IncompleteDate.js';
import type {DateFieldSectionWithoutPosition} from '../../DateField/types';
import {getEditableSections, isEditableSectionType, toEditableSection} from '../../DateField/utils';
import type {RangeValue} from '../../types';

export function getRangeEditableSections(
    sections: DateFieldSectionWithoutPosition[],
    value: RangeValue<IncompleteDate>,
    placeholder: RangeValue<DateTime>,
    delimiter: string,
) {
    const start = getEditableSections(sections, value.start, placeholder.start);
    const end = getEditableSections(sections, value.end, placeholder.end);

    const last = start[start.length - 1];
    let position = last.end;
    const previousEditableSection = last.nextEditableSection;
    const sectionsCount = start.length + 1;

    const delimiterSection = toEditableSection(
        {
            type: 'literal',
            contentType: 'letter',
            format: delimiter,
            placeholder: delimiter,
            hasLeadingZeros: false,
        },
        value.start,
        placeholder.start,
        position,
        previousEditableSection,
    );

    position += delimiterSection.textValue.length - 1;

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

        if (isEditableSectionType(section.type) && nextEditableSection === undefined) {
            nextEditableSection = index + sectionsCount;
        }
    }

    if (nextEditableSection !== undefined) {
        delimiterSection.nextEditableSection = nextEditableSection;

        start[previousEditableSection].nextEditableSection = nextEditableSection;
    }

    return [...start, delimiterSection, ...end];
}
