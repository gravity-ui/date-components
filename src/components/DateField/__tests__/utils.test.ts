import {dateTime, settings} from '@gravity-ui/date-utils';
import {beforeAll, describe, expect, it} from 'vitest';

import {i18n} from '../i18n';
import {splitFormatIntoSections} from '../utils';

describe('DateField utils: splitFormatIntoSections', () => {
    beforeAll(async () => {
        await settings.loadLocale('ru');
    });

    it('builds month and weekday options in the provided lang', () => {
        const sections = splitFormatIntoSections('MMMM dddd', i18n, 'ru');
        const monthSection = sections.find((section) => section.type === 'month');
        const weekdaySection = sections.find((section) => section.type === 'weekday');

        const expectedMonth = dateTime({lang: 'ru'})
            .startOf('year')
            .format('MMMM')
            .toLocaleUpperCase();
        const expectedWeekday = dateTime({lang: 'ru'}).day(0).format('dddd').toLocaleUpperCase();

        expect(monthSection?.options?.[0]).toBe(expectedMonth);
        expect(weekdaySection?.options?.[0]).toBe(expectedWeekday);
    });
});
