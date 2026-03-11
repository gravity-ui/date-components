import {dateTime, settings} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {ThemeProvider} from '@gravity-ui/uikit';
import {beforeAll, describe, expect, it} from 'vitest';
import {render} from 'vitest-browser-react';

import {cleanString} from '../../DateField/utils';
import {RangeDateField} from '../RangeDateField';

interface TestProps {
    lang: string;
    value: {start: DateTime; end: DateTime};
    format: string;
}

const delimiter = ` ${String.fromCharCode(0x2014)} `;

function Test({lang, value, format}: TestProps) {
    return (
        <ThemeProvider theme="light" lang={lang}>
            <RangeDateField value={value} format={format} />
        </ThemeProvider>
    );
}

describe('RangeDateField: i18n', () => {
    beforeAll(async () => {
        await settings.loadLocale('ru');
    });

    it('updates display text when provider lang changes', async () => {
        const value = {
            start: dateTime({input: '2024-01-15T00:00:00'}),
            end: dateTime({input: '2024-02-20T00:00:00'}),
        };

        const expectedEn = [
            value.start.locale('en').format('MMMM'),
            value.end.locale('en').format('MMMM'),
        ].join(delimiter);
        const expectedRu = [
            value.start.locale('ru').format('MMMM'),
            value.end.locale('ru').format('MMMM'),
        ].join(delimiter);

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
