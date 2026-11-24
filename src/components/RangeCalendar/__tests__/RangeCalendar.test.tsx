import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import type {RangeValue} from '../../types';
import {RangeCalendar} from '../RangeCalendar';
import type {RangeCalendarProps} from '../RangeCalendar';

type Screen = Awaited<ReturnType<typeof render>>;

function utc(input: string) {
    return dateTime({input, timeZone: 'UTC'});
}

function utcDay(date: string) {
    return utc(`${date}T00:00:00Z`);
}

function iso(range: RangeValue<DateTime>) {
    return {end: range.end.toISOString(), start: range.start.toISOString()};
}

function getCell(screen: Screen, date: string) {
    return screen.getByRole('button', {exact: true, name: utcDay(date).format('dddd, LL')});
}

function getSelectedCells(screen: Screen) {
    return Array.from(
        screen.container.querySelectorAll('[role="gridcell"][aria-selected="true"]'),
        (cell) => cell.textContent,
    );
}

// Changing the page or the mode animates the old grid out, and its cells duplicate the new ones.
async function waitForGridTransition(screen: Screen) {
    await expect.poll(() => screen.container.querySelector('[class*="previous-state"]')).toBeNull();
}

async function renderCalendar(props: RangeCalendarProps = {}) {
    const onBlur = vi.fn();
    const onUpdate = vi.fn<(value: RangeValue<DateTime>) => void>();
    const screen = await render(
        <div>
            <RangeCalendar
                defaultFocusedValue={utcDay('2024-01-15')}
                onBlur={onBlur}
                onUpdate={onUpdate}
                timeZone="UTC"
                {...props}
            />
            <button type="button">outside</button>
        </div>,
    );
    return {onBlur, onUpdate, screen};
}

describe('RangeCalendar', () => {
    describe('uncontrolled anchor', () => {
        it('selects a range with two clicks', async () => {
            const {onUpdate, screen} = await renderCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.click(getCell(screen, '2024-01-12'));
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-12T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
            await expect.poll(() => getSelectedCells(screen)).toEqual(['10', '11', '12']);
        });

        it('swaps the ends when the second click is before the first one', async () => {
            const {onUpdate, screen} = await renderCalendar();

            await userEvent.click(getCell(screen, '2024-01-12'));
            await userEvent.click(getCell(screen, '2024-01-10'));

            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-12T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
        });

        it('keeps the time of the existing value', async () => {
            const {onUpdate, screen} = await renderCalendar({
                defaultValue: {
                    end: utc('2024-01-05T18:30:00Z'),
                    start: utc('2024-01-03T10:15:00Z'),
                },
            });

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(getCell(screen, '2024-01-12'));

            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-12T18:30:00.000Z',
                start: '2024-01-10T10:15:00.000Z',
            });
        });

        it('highlights the range from the first click to the hovered date', async () => {
            const {onUpdate, screen} = await renderCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.hover(getCell(screen, '2024-01-14'));

            await expect
                .poll(() => getSelectedCells(screen))
                .toEqual(['10', '11', '12', '13', '14']);
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('completes the selection with a single day when focus leaves the calendar', async () => {
            const {onBlur, onUpdate, screen} = await renderCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(screen.getByRole('button', {name: 'outside'}));

            await expect.poll(() => onBlur).toHaveBeenCalled();
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-10T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
        });

        it('keeps the selection in progress when the page is changed', async () => {
            const {onBlur, onUpdate, screen} = await renderCalendar();

            await userEvent.click(getCell(screen, '2024-01-30'));
            await userEvent.click(screen.getByRole('button', {name: 'Next'}));
            await waitForGridTransition(screen);
            expect(onBlur).not.toHaveBeenCalled();
            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.click(getCell(screen, '2024-02-02'));
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-02-02T23:59:59.999Z',
                start: '2024-01-30T00:00:00.000Z',
            });
        });

        it('keeps the selection in progress when the mode is changed', async () => {
            const {onBlur, onUpdate, screen} = await renderCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(screen.getByRole('button', {exact: true, name: 'January 2024'}));
            await waitForGridTransition(screen);
            await userEvent.click(screen.getByRole('button', {exact: true, name: 'March 2024'}));
            await waitForGridTransition(screen);
            expect(onBlur).not.toHaveBeenCalled();
            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.click(getCell(screen, '2024-03-08'));
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-03-08T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
        });
    });
});
