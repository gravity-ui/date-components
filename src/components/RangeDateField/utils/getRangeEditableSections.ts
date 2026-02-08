import type {DateTime} from '@gravity-ui/date-utils';

import type {IncompleteDate} from '../../DateField/IncompleteDate.js';
import type {DateFieldSectionWithoutPosition} from '../../DateField/types';
import {
    connectEditableSections,
    getEditableSections,
    toEditableSection,
} from '../../DateField/utils';
import type {RangeValue} from '../../types';

export function getRangeEditableSections(
    sections: DateFieldSectionWithoutPosition[],
    value: RangeValue<IncompleteDate>,
    placeholder: RangeValue<DateTime>,
    delimiter: string,
) {
    const start = getEditableSections(sections, value.start, placeholder.start);
    const end = getEditableSections(sections, value.end, placeholder.end);

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
    );

    const editableSections = [...start, delimiterSection, ...end];
    connectEditableSections(editableSections);

    return editableSections;
}
