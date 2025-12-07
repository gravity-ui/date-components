import {dateTime} from '@gravity-ui/date-utils';
import {afterEach, describe, expect, test, vitest} from 'vitest';

import {render} from '#test-utils/utils.js';

import {Calendar} from '../Calendar';

const testDate = new Date(1998, 11, 19);

describe('Visual tests', {skip: !import.meta.env.VITE_CI}, () => {
    afterEach(() => {
        vitest.useRealTimers();
    });

    test('default view', async () => {
        vitest.setSystemTime(testDate);
        const screen = await render(<Calendar data-qa="calendar" />);
        await expect(screen.getByTestId('calendar')).toMatchScreenshot();
    });

    test('with selected date', async () => {
        const screen = await render(
            <Calendar data-qa="calendar" value={dateTime({input: testDate})} />,
        );
        await expect(screen.getByTestId('calendar')).toMatchScreenshot();
    });

    test('with focused date', async () => {
        const screen = await render(
            <Calendar data-qa="calendar" autoFocus focusedValue={dateTime({input: testDate})} />,
        );
        await expect(screen.getByTestId('calendar')).toMatchScreenshot();
    });
});
