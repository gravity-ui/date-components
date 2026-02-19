import {dateTime} from '@gravity-ui/date-utils';
import {afterEach, describe, expect, test, vitest} from 'vitest';

import {render} from '#test-utils/utils.js';

import {Calendar} from '../Calendar';

const testDate = new Date(1998, 11, 19);

describe.skipIf(!import.meta.env.VITE_CI).each([['light'], ['dark']])(
    'Visual tests [%s]',
    (theme) => {
        const options = {providers: {theme}};

        afterEach(() => {
            vitest.useRealTimers();
        });

        test('default view', async () => {
            vitest.setSystemTime(testDate);
            const screen = await render(<Calendar data-qa="calendar" />, options);
            await expect(screen.getByTestId('calendar')).toMatchScreenshot();
        });

        test('with selected date', async () => {
            const screen = await render(
                <Calendar data-qa="calendar" value={dateTime({input: testDate})} />,
                options,
            );
            await expect(screen.getByTestId('calendar')).toMatchScreenshot();
        });

        test('with multi-selected dates', async () => {
            const screen = await render(
                <Calendar
                    data-qa="calendar"
                    selectionMode="multiple"
                    value={[
                        dateTime({input: testDate}),
                        dateTime({input: testDate}).add(3, 'days'),
                    ]}
                />,
                options,
            );
            await expect(screen.getByTestId('calendar')).toMatchScreenshot();
        });

        test('with focused date', async () => {
            const screen = await render(
                <Calendar
                    data-qa="calendar"
                    autoFocus
                    focusedValue={dateTime({input: testDate})}
                />,
                options,
            );
            await expect(screen.getByTestId('calendar')).toMatchScreenshot();
        });

        test('with unavailable dates', async () => {
            vitest.setSystemTime(testDate);
            const screen = await render(
                <Calendar
                    data-qa="calendar"
                    isDateUnavailable={(date) => date.day() === 2 || date.date() === 19}
                />,
                options,
            );
            await expect(screen.getByTestId('calendar')).toMatchScreenshot();
        });

        test('with max date', async () => {
            vitest.setSystemTime(testDate);
            const screen = await render(
                <Calendar data-qa="calendar" maxValue={dateTime({input: testDate})} />,
                options,
            );
            await expect(screen.getByTestId('calendar')).toMatchScreenshot();
        });

        test('sizes', async () => {
            vitest.setSystemTime(testDate);
            const screen = await render(
                <div data-qa="calendar">
                    <Calendar size="m" />
                    <Calendar size="l" />
                    <Calendar size="xl" />
                </div>,
                options,
            );
            await expect(screen.getByTestId('calendar')).toMatchScreenshot();
        });
    },
);
