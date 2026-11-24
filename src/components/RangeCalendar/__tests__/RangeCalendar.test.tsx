import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render, renderHook} from '#test-utils/utils';

import {useRangeCalendarState} from '../../CalendarView/hooks/useRangeCalendarState';
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

function ControlledCalendar({anchorDate: initialAnchorDate = null, ...props}: RangeCalendarProps) {
    const [anchorDate, setAnchorDate] = React.useState(initialAnchorDate);
    return (
        <div>
            <RangeCalendar
                defaultFocusedValue={utcDay('2024-01-15')}
                timeZone="UTC"
                {...props}
                anchorDate={anchorDate}
                onUpdateAnchorDate={(date) => {
                    setAnchorDate(date);
                    props.onUpdateAnchorDate?.(date);
                }}
            />
            <button type="button">outside</button>
            <button onClick={() => setAnchorDate(null)} type="button">
                reset
            </button>
        </div>
    );
}

async function renderControlledCalendar(props: RangeCalendarProps = {}) {
    const onBlur = vi.fn();
    const onUpdate = vi.fn<(value: RangeValue<DateTime>) => void>();
    const onUpdateAnchorDate = vi.fn<(date: DateTime | null) => void>();
    const screen = await render(
        <ControlledCalendar
            onBlur={onBlur}
            onUpdate={onUpdate}
            onUpdateAnchorDate={onUpdateAnchorDate}
            {...props}
        />,
    );
    return {onBlur, onUpdate, onUpdateAnchorDate, screen};
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

        it('reports the anchor of an uncontrolled selection', async () => {
            const onUpdateAnchorDate = vi.fn<(date: DateTime | null) => void>();
            const {onBlur, onUpdate, screen} = await renderCalendar({onUpdateAnchorDate});

            await userEvent.click(getCell(screen, '2024-01-10'));
            expect(onUpdateAnchorDate.mock.calls[0][0]?.toISOString()).toBe(
                '2024-01-10T00:00:00.000Z',
            );

            await userEvent.click(screen.getByRole('button', {name: 'outside'}));
            await expect.poll(() => onBlur).toHaveBeenCalled();
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(onUpdateAnchorDate).toHaveBeenLastCalledWith(null);
        });
    });

    describe('controlled anchor', () => {
        it('reports the first click and does not update the value', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));

            expect(onUpdateAnchorDate).toHaveBeenCalledTimes(1);
            expect(onUpdateAnchorDate.mock.calls[0][0]?.toISOString()).toBe(
                '2024-01-10T00:00:00.000Z',
            );
            expect(onUpdate).not.toHaveBeenCalled();
            await expect.poll(() => getSelectedCells(screen)).toEqual(['10']);
        });

        it('completes the selection with the second click', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(getCell(screen, '2024-01-12'));

            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-12T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
            expect(onUpdateAnchorDate).toHaveBeenCalledTimes(2);
            expect(onUpdateAnchorDate).toHaveBeenLastCalledWith(null);
            await expect.poll(() => getSelectedCells(screen)).toEqual(['10', '11', '12']);
        });

        it('swaps the ends when the second click is before the first one', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar();

            await userEvent.click(getCell(screen, '2024-01-12'));
            await userEvent.click(getCell(screen, '2024-01-10'));

            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-12T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
            expect(onUpdateAnchorDate).toHaveBeenLastCalledWith(null);
        });

        it('keeps the time of the existing value', async () => {
            const {onUpdate, screen} = await renderControlledCalendar({
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

        it('keeps the selection in progress when focus leaves the calendar', async () => {
            const {onBlur, onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(screen.getByRole('button', {name: 'outside'}));

            await expect.poll(() => onBlur).toHaveBeenCalled();
            expect(onUpdate).not.toHaveBeenCalled();
            expect(onUpdateAnchorDate).toHaveBeenCalledTimes(1);
            expect(getSelectedCells(screen)).toEqual(['10']);

            await userEvent.click(getCell(screen, '2024-01-12'));
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-12T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
        });

        it('highlights the hovered range without taking focus back', async () => {
            const {onBlur, screen} = await renderControlledCalendar();
            const outside = screen.getByRole('button', {name: 'outside'});

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(outside);
            await expect.poll(() => onBlur).toHaveBeenCalled();
            await userEvent.hover(getCell(screen, '2024-01-13'));

            await expect.poll(() => getSelectedCells(screen)).toEqual(['10', '11', '12', '13']);
            await expect.element(outside).toHaveFocus();
        });

        it('keeps the selection in progress when the page is changed', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar();

            await userEvent.click(getCell(screen, '2024-01-30'));
            await userEvent.click(screen.getByRole('button', {name: 'Next'}));
            await waitForGridTransition(screen);
            expect(onUpdate).not.toHaveBeenCalled();
            expect(onUpdateAnchorDate).toHaveBeenCalledTimes(1);

            await userEvent.click(getCell(screen, '2024-02-02'));
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-02-02T23:59:59.999Z',
                start: '2024-01-30T00:00:00.000Z',
            });
        });

        it('keeps the selection in progress when the mode is changed', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(screen.getByRole('button', {exact: true, name: 'January 2024'}));
            await waitForGridTransition(screen);
            await userEvent.click(screen.getByRole('button', {exact: true, name: 'March 2024'}));
            await waitForGridTransition(screen);
            expect(onUpdate).not.toHaveBeenCalled();
            expect(onUpdateAnchorDate).toHaveBeenCalledTimes(1);

            await userEvent.click(getCell(screen, '2024-03-08'));
            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-03-08T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
        });

        it('moves focus to the hovered date while the grid is focused', async () => {
            const {screen} = await renderControlledCalendar();

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.hover(getCell(screen, '2024-01-13'));

            await expect.element(getCell(screen, '2024-01-13')).toHaveFocus();
        });

        it('cancels the selection when the anchor is reset to null', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar({
                defaultValue: {
                    end: utc('2024-01-05T18:30:00Z'),
                    start: utc('2024-01-03T10:15:00Z'),
                },
            });

            await userEvent.click(getCell(screen, '2024-01-10'));
            await expect.poll(() => getSelectedCells(screen)).toEqual(['10']);

            await userEvent.click(screen.getByRole('button', {name: 'reset'}));
            await expect.poll(() => getSelectedCells(screen)).toEqual(['3', '4', '5']);
            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.click(getCell(screen, '2024-01-20'));
            expect(onUpdate).not.toHaveBeenCalled();
            expect(onUpdateAnchorDate.mock.lastCall?.[0]?.toISOString()).toBe(
                '2024-01-20T00:00:00.000Z',
            );
        });

        it('starts from the anchor passed by the parent', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar({
                anchorDate: utcDay('2024-01-10'),
            });

            await userEvent.click(getCell(screen, '2024-01-12'));

            expect(iso(onUpdate.mock.calls[0][0])).toEqual({
                end: '2024-01-12T23:59:59.999Z',
                start: '2024-01-10T00:00:00.000Z',
            });
            expect(onUpdateAnchorDate).toHaveBeenCalledExactlyOnceWith(null);
        });

        it('shows the anchor from the prop when the parent ignores updates', async () => {
            const onUpdate = vi.fn();
            const onUpdateAnchorDate = vi.fn();
            const screen = await render(
                <RangeCalendar
                    anchorDate={null}
                    defaultFocusedValue={utcDay('2024-01-15')}
                    onUpdate={onUpdate}
                    onUpdateAnchorDate={onUpdateAnchorDate}
                    timeZone="UTC"
                />,
            );

            await userEvent.click(getCell(screen, '2024-01-10'));
            await userEvent.click(getCell(screen, '2024-01-12'));

            expect(onUpdate).not.toHaveBeenCalled();
            expect(onUpdateAnchorDate).toHaveBeenCalledTimes(2);
            expect(onUpdateAnchorDate.mock.lastCall?.[0]?.toISOString()).toBe(
                '2024-01-12T00:00:00.000Z',
            );
            expect(getSelectedCells(screen)).toEqual([]);
        });

        it('reports the anchor in the time zone of the value', async () => {
            const {onUpdate, onUpdateAnchorDate, screen} = await renderControlledCalendar({
                defaultValue: {
                    end: utc('2024-01-05T18:30:00Z'),
                    start: utc('2024-01-03T10:15:00Z'),
                },
                timeZone: 'Asia/Tokyo',
            });

            await userEvent.click(getCell(screen, '2024-01-10'));

            const anchorDate = onUpdateAnchorDate.mock.calls[0][0];
            expect(anchorDate?.timeZone()).toBe('UTC');
            // The start of January 10 in Tokyo
            expect(anchorDate?.toISOString()).toBe('2024-01-09T15:00:00.000Z');
            await expect.poll(() => getSelectedCells(screen)).toEqual(['10']);

            await userEvent.click(getCell(screen, '2024-01-12'));

            const range = onUpdate.mock.calls[0][0];
            expect(range.start.timeZone()).toBe('UTC');
            expect(range.end.timeZone()).toBe('UTC');
            // The time of the value is kept as it is seen in Tokyo
            expect(iso(range)).toEqual({
                end: '2024-01-11T18:30:00.000Z',
                start: '2024-01-10T10:15:00.000Z',
            });
            await expect.poll(() => getSelectedCells(screen)).toEqual(['10', '11', '12']);
        });

        it.each<[string, RangeCalendarProps]>([
            ['disabled', {disabled: true}],
            ['readOnly', {readOnly: true}],
            ['isDateUnavailable', {isDateUnavailable: (date) => date.date() === 10}],
            ['minValue', {minValue: utcDay('2024-01-12')}],
        ])('does not start the selection when %s forbids it', async (_name, props) => {
            const {onUpdateAnchorDate, screen} = await renderControlledCalendar(props);

            // The cell may be disabled, userEvent would wait for it to become enabled.
            (getCell(screen, '2024-01-10').element() as HTMLElement).click();

            expect(onUpdateAnchorDate).not.toHaveBeenCalled();
            expect(getSelectedCells(screen)).toEqual([]);
        });

        it('keeps `undefined` as the empty anchor in the state', async () => {
            const {result} = await renderHook(() => useRangeCalendarState({anchorDate: null}));

            expect(result.current.anchorDate).toBeUndefined();
        });
    });
});
