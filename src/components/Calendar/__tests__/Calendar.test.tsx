import {dateTime} from '@gravity-ui/date-utils';
import {afterEach, describe, expect, test, vitest} from 'vitest';

import {render} from '#test-utils/utils.js';

import {Calendar} from '../Calendar';

const testDate = new Date(1998, 11, 19);

function swipe(cell: Element, dx: number, dy = 0, end = 'pointerup') {
    const options = {bubbles: true, pointerType: 'touch', pointerId: 1, isPrimary: true};
    cell.dispatchEvent(new PointerEvent('pointerdown', {...options, clientX: 100, clientY: 100}));
    cell.dispatchEvent(new PointerEvent(end, {...options, clientX: 100 + dx, clientY: 100 + dy}));
    cell.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}));
}

test.each([
    {dir: 'ltr', nextSwipe: -80},
    {dir: 'rtl', nextSwipe: 80},
])('swipes between periods in $dir without selecting a date', async ({dir, nextSwipe}) => {
    const onUpdate = vitest.fn();
    const screen = await render(
        <div dir={dir}>
            <Calendar defaultFocusedValue={dateTime({input: testDate})} onUpdate={onUpdate} />
        </div>,
    );
    const grid = screen.getByRole('grid');
    const cell = grid.getByRole('button', {name: /December 19, 1998/}).element();

    swipe(cell, nextSwipe);
    await expect.element(grid).toHaveAccessibleName('January 1999');
    expect(onUpdate).not.toHaveBeenCalled();

    swipe(grid.getByRole('button', {name: /January 19, 1999/}).element(), -nextSwipe);
    await expect.element(grid).toHaveAccessibleName('December 1998');
    expect(onUpdate).not.toHaveBeenCalled();
});

test('ignores swipes past date bounds and still allows tapping dates', async () => {
    const date = dateTime({input: testDate});
    const onUpdate = vitest.fn();
    const screen = await render(
        <Calendar defaultFocusedValue={date} minValue={date} maxValue={date} onUpdate={onUpdate} />,
    );
    const grid = screen.getByRole('grid');
    const cell = grid.getByRole('button', {name: /December 19, 1998/});

    swipe(cell.element(), -80);
    swipe(cell.element(), 80);
    await expect.element(grid).toHaveAccessibleName('December 1998');
    expect(onUpdate).not.toHaveBeenCalled();

    await cell.click();
    expect(onUpdate).toHaveBeenCalledOnce();
});

test('does not page on short, vertical, or cancelled gestures', async () => {
    const screen = await render(<Calendar defaultFocusedValue={dateTime({input: testDate})} />);
    const grid = screen.getByRole('grid');

    swipe(grid.element(), -15);
    swipe(grid.element(), -50, 80);
    swipe(grid.element(), -80, 0, 'pointercancel');
    await expect.element(grid).toHaveAccessibleName('December 1998');
});

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
