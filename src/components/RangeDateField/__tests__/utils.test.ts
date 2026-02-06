import {dateTime} from '@gravity-ui/date-utils';
import {expect, test} from 'vitest';

import {IncompleteDate} from '../../DateField/IncompleteDate';
import {
    cleanString,
    formatSections,
    isEditableSectionType,
    splitFormatIntoSections,
} from '../../DateField/utils';
import {getRangeEditableSections} from '../utils';

test('create a valid sequence of editable sections for range', () => {
    const format = 'DD.MM.YYYY hh:mm:ss';
    const sections = splitFormatIntoSections(format);
    const date = dateTime({input: [2024, 1, 14, 12, 30, 0]});
    const range = {start: date, end: date};
    const incompleteRange = {
        start: new IncompleteDate().set('month', range.start.month() + 1),
        end: new IncompleteDate().set('year', range.end.year()),
    };
    const eSections = getRangeEditableSections(sections, incompleteRange, range, ' — ');

    expect(eSections.length).toBe(23);

    const indexes = eSections
        .map((s, i) => (isEditableSectionType(s.type) ? i : null))
        .filter((e) => e !== null);

    // eslint-disable-next-line no-nested-ternary
    const fixIndex = (i: number) => (i < 0 ? 0 : i >= indexes.length ? indexes.length - 1 : i);

    let pointer = -1;
    let position = 1;
    for (let i = 0; i < eSections.length; i++) {
        const section = eSections[i];
        if (isEditableSectionType(section.type)) {
            pointer++;
        }

        const previous = indexes[pointer] === i ? indexes[fixIndex(pointer - 1)] : indexes[pointer];
        const next = indexes[fixIndex(pointer + 1)];

        expect(section.previousEditableSection).toBe(previous);
        expect(section.nextEditableSection).toBe(next);
        expect(section.start).toBe(position);

        position = section.end;
    }

    expect(cleanString(formatSections(eSections))).toBe(
        'DD.02.YYYY hh:mm:ss — DD.MM.2024 hh:mm:ss',
    );
});
