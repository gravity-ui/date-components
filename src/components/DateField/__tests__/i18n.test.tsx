import {dateTime, settings} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {ThemeProvider} from '@gravity-ui/uikit';
import {beforeAll, describe, expect, it} from 'vitest';
import {render} from 'vitest-browser-react';

import {DateField} from '../DateField';
import {cleanString} from '../utils';

interface TestProps {
    lang: string;
    value: DateTime;
    format: string;
}

function Test({lang, value, format}: TestProps) {
    return (
        <ThemeProvider theme="light" lang={lang}>
            <DateField value={value} format={format} />
        </ThemeProvider>
    );
}

describe('DateField: i18n', () => {
    beforeAll(async () => {
        await settings.loadLocale('ru');
    });

    it('updates display text when provider lang changes', async () => {
        const value = dateTime({input: '2024-01-15T00:00:00'});
        const expectedEn = value.locale('en').format('MMMM');
        const expectedRu = value.locale('ru').format('MMMM');

        const {getByRole, rerender} = await render(<Test lang="en" value={value} format="MMMM" />);

        const initialInput = getByRole('textbox').element() as HTMLInputElement;
        const initialText = cleanString(initialInput.value);
        expect(initialText).toBe(expectedEn);

        await rerender(<Test lang="ru" value={value} format="MMMM" />);

        const updatedInput = getByRole('textbox').element() as HTMLInputElement;
        const updatedText = cleanString(updatedInput.value);
        expect(updatedText).toBe(expectedRu);
        expect(updatedText).not.toBe(expectedEn);
    });
});
