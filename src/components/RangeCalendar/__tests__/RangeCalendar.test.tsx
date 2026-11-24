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

const valueWithTime = {
    end: dateTime({input: '2024-01-05T18:30:00Z', timeZone: 'UTC'}),
    start: dateTime({input: '2024-01-03T10:15:00Z', timeZone: 'UTC'}),
};

function utcDay(date: string) {
    return dateTime({input: `${date}T00:00:00Z`, timeZone: 'UTC'});
}

function days(start: string, end: string) {
    return {end: `${end}T23:59:59.999Z`, start: `${start}T00:00:00.000Z`};
}

function TestCalendar({controlled, ...props}: RangeCalendarProps & {controlled: boolean}) {
    const [anchorDate, setAnchorDate] = React.useState(props.anchorDate ?? null);
    return (
        <div>
            <RangeCalendar
                defaultFocusedValue={utcDay('2024-01-15')}
                timeZone="UTC"
                {...props}
                anchorDate={controlled ? anchorDate : undefined}
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

async function renderCalendar(controlled: boolean, props: RangeCalendarProps = {}) {
    const onBlur = vi.fn();
    const onUpdate = vi.fn<(value: RangeValue<DateTime>) => void>();
    const onUpdateAnchorDate = vi.fn<(date: DateTime | null) => void>();
    const screen = await render(
        <TestCalendar
            controlled={controlled}
            onBlur={onBlur}
            onUpdate={onUpdate}
            onUpdateAnchorDate={onUpdateAnchorDate}
            {...props}
        />,
    );

    const button = (name: string) => screen.getByRole('button', {exact: true, name});
    const cell = (date: string) => button(utcDay(date).format('dddd, LL'));

    return {
        anchors: () => onUpdateAnchorDate.mock.calls.map(([date]) => date?.toISOString() ?? null),
        async blur() {
            await userEvent.click(button('outside'));
            await expect.poll(() => onBlur).toHaveBeenCalled();
        },
        button,
        cell,
        click: (date: string) => userEvent.click(cell(date)),
        // Changing the page or the mode animates the old grid out, and its cells duplicate the new ones.
        async navigate(name: string) {
            await userEvent.click(button(name));
            await expect
                .poll(() => screen.container.querySelector('[class*="previous-state"]'))
                .toBeNull();
        },
        onBlur,
        onUpdate,
        onUpdateAnchorDate,
        selected: () =>
            Array.from(
                screen.container.querySelectorAll('[role="gridcell"][aria-selected="true"]'),
                (element) => element.textContent,
            ),
        updates: () =>
            onUpdate.mock.calls.map(([{end, start}]) => ({
                end: end.toISOString(),
                start: start.toISOString(),
            })),
    };
}

describe('RangeCalendar', () => {
    describe.each([
        ['uncontrolled', false],
        ['controlled', true],
    ])('%s anchor', (_name, controlled) => {
        it('selects a range with two clicks', async () => {
            const calendar = await renderCalendar(controlled);

            await calendar.click('2024-01-10');
            expect(calendar.anchors()).toEqual(['2024-01-10T00:00:00.000Z']);
            expect(calendar.updates()).toEqual([]);

            await calendar.click('2024-01-12');
            expect(calendar.anchors()).toEqual(['2024-01-10T00:00:00.000Z', null]);
            expect(calendar.updates()).toEqual([days('2024-01-10', '2024-01-12')]);
            await expect.poll(calendar.selected).toEqual(['10', '11', '12']);
        });

        it('swaps the ends when the second click is before the first one', async () => {
            const calendar = await renderCalendar(controlled);

            await calendar.click('2024-01-12');
            await calendar.click('2024-01-10');

            expect(calendar.updates()).toEqual([days('2024-01-10', '2024-01-12')]);
        });

        it('keeps the time of the existing value', async () => {
            const calendar = await renderCalendar(controlled, {defaultValue: valueWithTime});

            await calendar.click('2024-01-10');
            await calendar.click('2024-01-12');

            expect(calendar.updates()).toEqual([
                {end: '2024-01-12T18:30:00.000Z', start: '2024-01-10T10:15:00.000Z'},
            ]);
        });

        it('highlights the range from the first click to the hovered date', async () => {
            const calendar = await renderCalendar(controlled);

            await calendar.click('2024-01-10');
            await userEvent.hover(calendar.cell('2024-01-13'));

            await expect.poll(calendar.selected).toEqual(['10', '11', '12', '13']);
            await expect.element(calendar.cell('2024-01-13')).toHaveFocus();
            expect(calendar.updates()).toEqual([]);
        });

        it('keeps the selection in progress when the page is changed', async () => {
            const calendar = await renderCalendar(controlled);

            await calendar.click('2024-01-30');
            await calendar.navigate('Next');
            expect(calendar.onBlur).not.toHaveBeenCalled();
            expect(calendar.updates()).toEqual([]);

            await calendar.click('2024-02-02');
            expect(calendar.updates()).toEqual([days('2024-01-30', '2024-02-02')]);
        });

        it('keeps the selection in progress when the mode is changed', async () => {
            const calendar = await renderCalendar(controlled);

            await calendar.click('2024-01-10');
            await calendar.navigate('January 2024');
            await calendar.navigate('March 2024');
            expect(calendar.onBlur).not.toHaveBeenCalled();
            expect(calendar.updates()).toEqual([]);

            await calendar.click('2024-03-08');
            expect(calendar.updates()).toEqual([days('2024-01-10', '2024-03-08')]);
        });
    });

    it('completes an uncontrolled selection with a single day when focus leaves the calendar', async () => {
        const calendar = await renderCalendar(false);

        await calendar.click('2024-01-10');
        await calendar.blur();

        expect(calendar.updates()).toEqual([days('2024-01-10', '2024-01-10')]);
        expect(calendar.anchors()).toEqual(['2024-01-10T00:00:00.000Z', null]);
    });

    describe('controlled anchor', () => {
        it('keeps the selection in progress when focus leaves the calendar', async () => {
            const calendar = await renderCalendar(true);

            await calendar.click('2024-01-10');
            await calendar.blur();
            expect(calendar.updates()).toEqual([]);
            expect(calendar.anchors()).toEqual(['2024-01-10T00:00:00.000Z']);

            await userEvent.hover(calendar.cell('2024-01-13'));
            await expect.poll(calendar.selected).toEqual(['10', '11', '12', '13']);
            await expect.element(calendar.button('outside')).toHaveFocus();

            await calendar.click('2024-01-12');
            expect(calendar.updates()).toEqual([days('2024-01-10', '2024-01-12')]);
        });

        it('cancels the selection when the anchor is reset to null', async () => {
            const calendar = await renderCalendar(true, {defaultValue: valueWithTime});

            await calendar.click('2024-01-10');
            await expect.poll(calendar.selected).toEqual(['10']);

            await userEvent.click(calendar.button('reset'));
            await expect.poll(calendar.selected).toEqual(['3', '4', '5']);

            await calendar.click('2024-01-20');
            expect(calendar.anchors()).toEqual([
                '2024-01-10T00:00:00.000Z',
                '2024-01-20T00:00:00.000Z',
            ]);
            expect(calendar.updates()).toEqual([]);
        });

        it('starts from the anchor passed by the parent', async () => {
            const calendar = await renderCalendar(true, {anchorDate: utcDay('2024-01-10')});

            await calendar.click('2024-01-12');

            expect(calendar.updates()).toEqual([days('2024-01-10', '2024-01-12')]);
            expect(calendar.anchors()).toEqual([null]);
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

            await userEvent.click(
                screen.getByRole('button', {name: 'Wednesday, January 10, 2024'}),
            );
            await userEvent.click(screen.getByRole('button', {name: 'Friday, January 12, 2024'}));

            expect(onUpdateAnchorDate).toHaveBeenCalledTimes(2);
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('reports the anchor in the time zone of the value', async () => {
            const calendar = await renderCalendar(true, {
                defaultValue: valueWithTime,
                timeZone: 'Asia/Tokyo',
            });

            await calendar.click('2024-01-10');

            const anchorDate = calendar.onUpdateAnchorDate.mock.calls[0][0];
            expect(anchorDate?.timeZone()).toBe('UTC');
            // The start of January 10 in Tokyo
            expect(anchorDate?.toISOString()).toBe('2024-01-09T15:00:00.000Z');
            await expect.poll(calendar.selected).toEqual(['10']);

            await calendar.click('2024-01-12');

            const range = calendar.onUpdate.mock.calls[0][0];
            expect(range.start.timeZone()).toBe('UTC');
            expect(range.end.timeZone()).toBe('UTC');
            await expect.poll(calendar.selected).toEqual(['10', '11', '12']);
        });

        it.each<[string, RangeCalendarProps]>([
            ['disabled', {disabled: true}],
            ['readOnly', {readOnly: true}],
            ['isDateUnavailable', {isDateUnavailable: (date) => date.date() === 10}],
            ['minValue', {minValue: utcDay('2024-01-12')}],
        ])('does not start the selection when %s forbids it', async (_name, props) => {
            const calendar = await renderCalendar(true, props);

            // The cell may be disabled, userEvent would wait for it to become enabled.
            (calendar.cell('2024-01-10').element() as HTMLElement).click();

            expect(calendar.anchors()).toEqual([]);
        });

        it('keeps `undefined` as the empty anchor in the state', async () => {
            const {result} = await renderHook(() => useRangeCalendarState({anchorDate: null}));

            expect(result.current.anchorDate).toBeUndefined();
        });
    });
});
