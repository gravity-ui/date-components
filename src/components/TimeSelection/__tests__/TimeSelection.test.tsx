import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {afterEach, describe, expect, it, test, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import type {Locator} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {TimeSelection} from '../TimeSelection';
import type {TimeSelectionProps, TimeSelectionView} from '../types';

const FORMAT = 'YYYY-MM-DDTHH:mm:ss';

function time(input: string) {
    return dateTime({input: `${input}Z`, timeZone: 'UTC'});
}

const value = time('2024-01-15T10:30:45');

function column(screen: {getByRole: Locator['getByRole']}, name: string) {
    return screen.getByRole('listbox', {name, exact: true});
}

function option(list: Locator, name: string) {
    return list.getByRole('option', {name, exact: true});
}

function optionLabels(list: Locator) {
    return list
        .getByRole('option')
        .elements()
        .map((element) => element.textContent);
}

function lastValue(onUpdate: ReturnType<typeof vi.fn>) {
    const calls = onUpdate.mock.calls;
    return (calls[calls.length - 1][0] as DateTime).format(FORMAT);
}

/** The distance from the row to the top and to the bottom edge of the visible part of its column */
function getRowGaps(list: Locator, row: Locator) {
    const container = list.element();
    const containerRect = container.getBoundingClientRect();
    const rowRect = row.element().getBoundingClientRect();
    return {
        top: rowRect.top - containerRect.top,
        bottom: containerRect.bottom - rowRect.bottom,
        scrollTop: container.scrollTop,
        maxScrollTop: container.scrollHeight - container.clientHeight,
    };
}

function Controlled(props: TimeSelectionProps) {
    const [current, setCurrent] = React.useState(props.value ?? null);
    return (
        <TimeSelection
            {...props}
            value={current}
            onUpdate={(next) => {
                setCurrent(next);
                props.onUpdate?.(next);
            }}
        />
    );
}

describe('TimeSelection', () => {
    describe('columns', () => {
        it('renders hours and minutes by default', async () => {
            const screen = await render(<TimeSelection aria-label="Time" value={value} />);

            await expect.element(screen.getByRole('group', {name: 'Time'})).toBeInTheDocument();
            expect(screen.getByRole('listbox').elements()).toHaveLength(2);

            const hours = optionLabels(column(screen, 'Hours'));
            expect(hours).toHaveLength(24);
            expect(hours.slice(0, 3)).toEqual(['00', '01', '02']);
            expect(hours[23]).toBe('23');

            const minutes = optionLabels(column(screen, 'Minutes'));
            expect(minutes).toHaveLength(60);
            expect(minutes[59]).toBe('59');
        });

        it('keeps the order of the columns whatever the order of views is', async () => {
            const screen = await render(
                <TimeSelection value={value} views={['seconds', 'hours', 'minutes']} ampm />,
            );

            const labels = screen
                .getByRole('listbox')
                .elements()
                .map((element) => element.getAttribute('aria-label'));
            expect(labels).toEqual(['Hours', 'Minutes', 'Seconds', 'AM/PM']);
        });

        it('renders any subset of views', async () => {
            const screen = await render(<TimeSelection value={value} views={['seconds']} />);

            const labels = screen
                .getByRole('listbox')
                .elements()
                .map((element) => element.getAttribute('aria-label'));
            expect(labels).toEqual(['Seconds']);
        });

        it('shows the 12-hour clock with ampm', async () => {
            const screen = await render(<TimeSelection value={time('2024-01-15T15:30:00')} ampm />);

            const hours = column(screen, 'Hours');
            expect(optionLabels(hours)).toEqual([
                '12',
                '01',
                '02',
                '03',
                '04',
                '05',
                '06',
                '07',
                '08',
                '09',
                '10',
                '11',
            ]);
            await expect.element(option(hours, '03')).toHaveAttribute('aria-selected', 'true');

            const meridiem = column(screen, 'AM/PM');
            expect(optionLabels(meridiem)).toEqual(['AM', 'PM']);
            await expect.element(option(meridiem, 'PM')).toHaveAttribute('aria-selected', 'true');
            await expect.element(option(meridiem, 'AM')).toHaveAttribute('aria-selected', 'false');
        });

        it('selects 12 for midnight and noon with ampm', async () => {
            const screen = await render(<TimeSelection value={time('2024-01-15T00:05:00')} ampm />);
            await expect
                .element(option(column(screen, 'Hours'), '12'))
                .toHaveAttribute('aria-selected', 'true');
            await expect
                .element(option(column(screen, 'AM/PM'), 'AM'))
                .toHaveAttribute('aria-selected', 'true');

            await screen.rerender(<TimeSelection value={time('2024-01-15T12:05:00')} ampm />);
            await expect
                .element(option(column(screen, 'Hours'), '12'))
                .toHaveAttribute('aria-selected', 'true');
            await expect
                .element(option(column(screen, 'AM/PM'), 'PM'))
                .toHaveAttribute('aria-selected', 'true');
        });

        it('changes the hour and the half of the day separately with ampm', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <Controlled value={time('2024-01-15T15:30:00')} ampm onUpdate={onUpdate} />,
            );

            await option(column(screen, 'Hours'), '12').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T12:30:00');

            await option(column(screen, 'Hours'), '05').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T17:30:00');

            await option(column(screen, 'AM/PM'), 'AM').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T05:30:00');
        });

        it('labels the columns in the language of the provider', async () => {
            const screen = await render(
                <TimeSelection value={value} views={['hours', 'minutes', 'seconds']} ampm />,
                {providers: {lang: 'ru'}},
            );

            const labels = screen
                .getByRole('listbox')
                .elements()
                .map((element) => element.getAttribute('aria-label'));
            expect(labels).toEqual(['Часы', 'Минуты', 'Секунды', 'AM/PM']);
        });
    });

    describe('steps', () => {
        it('renders the options of a column by its step', async () => {
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:00')}
                    views={['hours', 'minutes', 'seconds']}
                    timeSteps={{hours: 6, minutes: 15}}
                />,
            );

            expect(optionLabels(column(screen, 'Hours'))).toEqual(['00', '06', '12', '18']);
            expect(optionLabels(column(screen, 'Minutes'))).toEqual(['00', '15', '30', '45']);
            expect(optionLabels(column(screen, 'Seconds'))).toHaveLength(60);
            await expect
                .element(option(column(screen, 'Minutes'), '30'))
                .toHaveAttribute('aria-selected', 'true');
        });

        it('selects nothing in a column when the value does not fit its step', async () => {
            const screen = await render(
                <TimeSelection value={time('2024-01-15T10:20:00')} timeSteps={{minutes: 15}} />,
            );

            const minutes = column(screen, 'Minutes');
            expect(
                minutes
                    .getByRole('option')
                    .elements()
                    .filter((element) => element.getAttribute('aria-selected') === 'true'),
            ).toHaveLength(0);
            await expect
                .element(option(column(screen, 'Hours'), '10'))
                .toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('selection', () => {
        it('marks the options of the value as selected', async () => {
            const screen = await render(
                <TimeSelection value={value} views={['hours', 'minutes', 'seconds']} />,
            );

            await expect
                .element(option(column(screen, 'Hours'), '10'))
                .toHaveAttribute('aria-selected', 'true');
            await expect
                .element(option(column(screen, 'Hours'), '11'))
                .toHaveAttribute('aria-selected', 'false');
            await expect
                .element(option(column(screen, 'Minutes'), '30'))
                .toHaveAttribute('aria-selected', 'true');
            await expect
                .element(option(column(screen, 'Seconds'), '45'))
                .toHaveAttribute('aria-selected', 'true');
        });

        it('changes only the unit of the clicked option', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={value}
                    views={['hours', 'minutes', 'seconds']}
                    onUpdate={onUpdate}
                />,
            );

            await option(column(screen, 'Hours'), '14').click();
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(lastValue(onUpdate)).toBe('2024-01-15T14:30:45');

            await option(column(screen, 'Minutes'), '05').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:05:45');

            await option(column(screen, 'Seconds'), '00').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:30:00');
        });

        it('works uncontrolled with defaultValue', async () => {
            const onUpdate = vi.fn();
            const screen = await render(<TimeSelection defaultValue={value} onUpdate={onUpdate} />);

            await option(column(screen, 'Hours'), '14').click();
            await expect
                .element(option(column(screen, 'Hours'), '14'))
                .toHaveAttribute('aria-selected', 'true');

            await option(column(screen, 'Minutes'), '05').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T14:05:45');
        });

        it('does not report the value that is already selected', async () => {
            const onUpdate = vi.fn();
            const screen = await render(<TimeSelection value={value} onUpdate={onUpdate} />);

            await option(column(screen, 'Hours'), '10').click();
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('selects nothing while the value is null and starts from the placeholder', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={null}
                    views={['hours', 'minutes', 'seconds']}
                    placeholderValue={time('2024-03-10T00:00:00')}
                    onUpdate={onUpdate}
                />,
            );

            expect(
                screen
                    .getByRole('option')
                    .elements()
                    .filter((element) => element.getAttribute('aria-selected') === 'true'),
            ).toHaveLength(0);

            await option(column(screen, 'Minutes'), '25').click();
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(lastValue(onUpdate)).toBe('2024-03-10T00:25:00');
        });

        it('takes the units that are not picked yet from the placeholder', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={null}
                    placeholderValue={time('2024-03-10T08:15:20')}
                    onUpdate={onUpdate}
                />,
            );

            await option(column(screen, 'Hours'), '09').click();
            expect(lastValue(onUpdate)).toBe('2024-03-10T09:15:20');
        });

        it('uses today at midnight when there is neither a value nor a placeholder', async () => {
            const onUpdate = vi.fn();
            const screen = await render(<TimeSelection timeZone="UTC" onUpdate={onUpdate} />);
            const today = dateTime({timeZone: 'UTC'}).format('YYYY-MM-DD');

            await option(column(screen, 'Hours'), '07').click();
            const next = onUpdate.mock.calls[0][0] as DateTime;
            expect(next.timeZone('UTC').format(FORMAT)).toBe(`${today}T07:00:00`);
        });

        it('shows the value in the given time zone and keeps the time zone of the value', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection value={value} timeZone="Asia/Tokyo" onUpdate={onUpdate} />,
            );

            // 10:30 UTC is 19:30 in Tokyo
            await expect
                .element(option(column(screen, 'Hours'), '19'))
                .toHaveAttribute('aria-selected', 'true');

            await option(column(screen, 'Hours'), '20').click();
            const next = onUpdate.mock.calls[0][0] as DateTime;
            expect(next.timeZone()).toBe('UTC');
            expect(next.format(FORMAT)).toBe('2024-01-15T11:30:45');
        });
    });

    describe('keyboard', () => {
        it('moves the active option with arrows without changing the value', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection value={value} defaultFocusView="hours" onUpdate={onUpdate} />,
            );
            const hours = column(screen, 'Hours');
            await expect.element(option(hours, '10')).toHaveFocus();

            await userEvent.keyboard('{ArrowDown}');
            await expect.element(option(hours, '11')).toHaveFocus();
            await userEvent.keyboard('{ArrowUp}{ArrowUp}');
            await expect.element(option(hours, '09')).toHaveFocus();
            await userEvent.keyboard('{End}');
            await expect.element(option(hours, '23')).toHaveFocus();
            await userEvent.keyboard('{Home}');
            await expect.element(option(hours, '00')).toHaveFocus();
            await userEvent.keyboard('{PageDown}');
            await expect.element(option(hours, '00')).not.toHaveFocus();

            expect(onUpdate).not.toHaveBeenCalled();
            await expect.element(option(hours, '10')).toHaveAttribute('aria-selected', 'true');
        });

        it('moves the active option by typing without changing the value', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection value={value} defaultFocusView="hours" onUpdate={onUpdate} />,
            );
            const hours = column(screen, 'Hours');
            await expect.element(option(hours, '10')).toHaveFocus();

            await userEvent.keyboard('17');
            await expect.element(option(hours, '17')).toHaveFocus();
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('selects the active option with Enter and moves focus to the next column', async () => {
            const onUpdate = vi.fn();
            const onFocusViewUpdate = vi.fn();
            const screen = await render(
                <Controlled
                    value={value}
                    defaultFocusView="hours"
                    onUpdate={onUpdate}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );
            await expect.element(option(column(screen, 'Hours'), '10')).toHaveFocus();

            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.keyboard('{Enter}');
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(lastValue(onUpdate)).toBe('2024-01-15T12:30:45');
            // The next column is entered at its selected option
            await expect.element(option(column(screen, 'Minutes'), '30')).toHaveFocus();
            expect(onFocusViewUpdate).toHaveBeenCalledTimes(1);
            expect(onFocusViewUpdate).toHaveBeenLastCalledWith('minutes');
        });

        it('selects the active option with Space', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <Controlled value={value} defaultFocusView="minutes" onUpdate={onUpdate} />,
            );
            await expect.element(option(column(screen, 'Minutes'), '30')).toHaveFocus();

            await userEvent.keyboard('{ArrowUp}');
            expect(onUpdate).not.toHaveBeenCalled();
            await userEvent.keyboard(' ');
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:29:45');
        });

        it('keeps focus in the last column after a selection', async () => {
            const onFocusViewUpdate = vi.fn();
            const screen = await render(
                <Controlled
                    value={value}
                    defaultFocusView="minutes"
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );
            const minutes = column(screen, 'Minutes');
            await expect.element(option(minutes, '30')).toHaveFocus();

            await userEvent.keyboard('{ArrowDown}{Enter}');
            await expect.element(option(minutes, '31')).toHaveAttribute('aria-selected', 'true');
            await expect.element(option(minutes, '31')).toHaveFocus();
            expect(onFocusViewUpdate).not.toHaveBeenCalled();
        });

        it('moves focus to the next column after a click', async () => {
            const onFocusViewUpdate = vi.fn();
            const screen = await render(
                <Controlled
                    value={value}
                    views={['hours', 'minutes', 'seconds']}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );

            await option(column(screen, 'Hours'), '08').click();
            await expect.element(option(column(screen, 'Minutes'), '30')).toHaveFocus();
            expect(onFocusViewUpdate.mock.calls.map(([view]) => view)).toEqual([
                'hours',
                'minutes',
            ]);
        });

        it('moves between the columns with left and right arrows without wrapping', async () => {
            const onUpdate = vi.fn();
            const onFocusViewUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:45')}
                    ampm
                    defaultFocusView="hours"
                    onUpdate={onUpdate}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );
            const hours = column(screen, 'Hours');
            const minutes = column(screen, 'Minutes');
            const meridiem = column(screen, 'AM/PM');
            await expect.element(option(hours, '10')).toHaveFocus();

            await userEvent.keyboard('{ArrowLeft}');
            await expect.element(option(hours, '10')).toHaveFocus();

            await userEvent.keyboard('{ArrowRight}');
            await expect.element(option(minutes, '30')).toHaveFocus();
            expect(onFocusViewUpdate).toHaveBeenLastCalledWith('minutes');

            // The AM/PM column takes focus but is not a view
            await userEvent.keyboard('{ArrowRight}');
            await expect.element(option(meridiem, 'AM')).toHaveFocus();
            expect(onFocusViewUpdate).toHaveBeenCalledTimes(1);

            await userEvent.keyboard('{ArrowRight}');
            await expect.element(option(meridiem, 'AM')).toHaveFocus();

            await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
            await expect.element(option(hours, '10')).toHaveFocus();
            expect(onFocusViewUpdate.mock.calls.map(([view]) => view)).toEqual([
                'minutes',
                'hours',
            ]);
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('enters a column at its selected option, not at the option left active before', async () => {
            const screen = await render(<TimeSelection value={value} defaultFocusView="hours" />);
            const hours = column(screen, 'Hours');
            await expect.element(option(hours, '10')).toHaveFocus();

            await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
            await expect.element(option(column(screen, 'Minutes'), '30')).toHaveFocus();

            await userEvent.keyboard('{ArrowLeft}');
            await expect.element(option(hours, '10')).toHaveFocus();
        });
    });

    describe('focus', () => {
        it('does not take focus without focusedView and defaultFocusView', async () => {
            const onFocus = vi.fn();
            const onFocusViewUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={value}
                    onFocus={onFocus}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );
            await expect.element(column(screen, 'Hours')).toBeInTheDocument();

            expect(document.activeElement).toBe(document.body);
            expect(onFocus).not.toHaveBeenCalled();
            expect(onFocusViewUpdate).not.toHaveBeenCalled();
        });

        it('takes focus into the column of defaultFocusView on mount', async () => {
            const onFocus = vi.fn();
            const onFocusViewUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={value}
                    defaultFocusView="minutes"
                    onFocus={onFocus}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );

            await expect.element(option(column(screen, 'Minutes'), '30')).toHaveFocus();
            expect(onFocus).toHaveBeenCalledTimes(1);
            // The consumer asked for this view itself
            expect(onFocusViewUpdate).not.toHaveBeenCalled();
        });

        it('focuses the first option when nothing is selected', async () => {
            const screen = await render(<TimeSelection value={null} defaultFocusView="hours" />);

            await expect.element(option(column(screen, 'Hours'), '00')).toHaveFocus();
        });

        it('moves focus when focusedView changes', async () => {
            const onFocusViewUpdate = vi.fn();
            const props = {
                value,
                views: ['hours', 'minutes', 'seconds'] as TimeSelectionView[],
                onFocusViewUpdate,
            };
            const screen = await render(<TimeSelection {...props} focusedView="hours" />);
            await expect.element(option(column(screen, 'Hours'), '10')).toHaveFocus();

            await screen.rerender(<TimeSelection {...props} focusedView="seconds" />);
            await expect.element(option(column(screen, 'Seconds'), '45')).toHaveFocus();
            expect(onFocusViewUpdate).not.toHaveBeenCalled();
        });

        it('reports focus that leaves the component', async () => {
            const onBlur = vi.fn();
            const screen = await render(
                <div>
                    <TimeSelection value={value} defaultFocusView="hours" onBlur={onBlur} />
                    <button type="button">After</button>
                </div>,
            );
            await expect.element(option(column(screen, 'Hours'), '10')).toHaveFocus();

            await userEvent.keyboard('{ArrowRight}');
            expect(onBlur).not.toHaveBeenCalled();

            await screen.getByRole('button', {name: 'After'}).click();
            expect(onBlur).toHaveBeenCalledTimes(1);
        });
    });

    describe('availability', () => {
        it('disables the options whose whole interval is out of minValue and maxValue', async () => {
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:00')}
                    views={['hours', 'minutes', 'seconds']}
                    minValue={time('2024-01-15T10:20:30')}
                    maxValue={time('2024-01-15T18:00:00')}
                />,
            );
            const hours = column(screen, 'Hours');
            const minutes = column(screen, 'Minutes');

            await expect.element(option(hours, '09')).toHaveAttribute('aria-disabled', 'true');
            // A part of the hour is still in range
            await expect.element(option(hours, '10')).not.toHaveAttribute('aria-disabled');
            await expect.element(option(hours, '18')).not.toHaveAttribute('aria-disabled');
            await expect.element(option(hours, '19')).toHaveAttribute('aria-disabled', 'true');

            await expect.element(option(minutes, '19')).toHaveAttribute('aria-disabled', 'true');
            // A part of the minute is still in range
            await expect.element(option(minutes, '20')).not.toHaveAttribute('aria-disabled');
            await expect.element(option(minutes, '59')).not.toHaveAttribute('aria-disabled');
        });

        it('disables every option when the date is out of range', async () => {
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:00')}
                    minValue={time('2024-01-16T00:00:00')}
                />,
            );

            expect(
                screen
                    .getByRole('option')
                    .elements()
                    .every((element) => element.getAttribute('aria-disabled') === 'true'),
            ).toBe(true);
        });

        it('disables a half of the day that is out of range', async () => {
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:00')}
                    ampm
                    maxValue={time('2024-01-15T11:00:00')}
                />,
            );
            const meridiem = column(screen, 'AM/PM');

            await expect.element(option(meridiem, 'AM')).not.toHaveAttribute('aria-disabled');
            await expect.element(option(meridiem, 'PM')).toHaveAttribute('aria-disabled', 'true');
        });

        it('keeps the picked value within minValue and maxValue', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <Controlled
                    value={time('2024-01-15T12:10:00')}
                    minValue={time('2024-01-15T10:20:00')}
                    maxValue={time('2024-01-15T18:05:00')}
                    onUpdate={onUpdate}
                />,
            );

            await option(column(screen, 'Hours'), '10').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:20:00');

            await option(column(screen, 'Hours'), '18').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T18:05:00');
        });

        it('skips unavailable options on keyboard navigation and ignores clicks on them', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:00')}
                    minValue={time('2024-01-15T10:00:00')}
                    defaultFocusView="hours"
                    onUpdate={onUpdate}
                />,
            );
            const hours = column(screen, 'Hours');
            await expect.element(option(hours, '10')).toHaveFocus();

            await userEvent.keyboard('{Home}');
            await expect.element(option(hours, '10')).toHaveFocus();

            await option(hours, '09').click({force: true});
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('disables the options isTimeUnavailable rejects', async () => {
            const onUpdate = vi.fn();
            const isTimeUnavailable = vi.fn(
                (date: DateTime, view: TimeSelectionView) =>
                    (view === 'hours' && date.hour() === 13) ||
                    (view === 'minutes' && date.minute() % 2 === 1),
            );
            const screen = await render(
                <TimeSelection
                    value={value}
                    isTimeUnavailable={isTimeUnavailable}
                    onUpdate={onUpdate}
                />,
            );
            const hours = column(screen, 'Hours');
            const minutes = column(screen, 'Minutes');

            await expect.element(option(hours, '13')).toHaveAttribute('aria-disabled', 'true');
            await expect.element(option(hours, '12')).not.toHaveAttribute('aria-disabled');
            await expect.element(option(minutes, '31')).toHaveAttribute('aria-disabled', 'true');
            await expect.element(option(minutes, '32')).not.toHaveAttribute('aria-disabled');

            // The callback gets the value with the unit of the option put into it
            const hourCall = isTimeUnavailable.mock.calls.find(
                ([date, view]) => view === 'hours' && date.hour() === 13,
            );
            expect(hourCall?.[0].format(FORMAT)).toBe('2024-01-15T13:30:45');

            await option(hours, '13').click({force: true});
            expect(onUpdate).not.toHaveBeenCalled();
        });
    });

    describe('readOnly and disabled', () => {
        it('keeps the options navigable but not selectable when readOnly', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    value={value}
                    readOnly
                    defaultFocusView="hours"
                    onUpdate={onUpdate}
                />,
            );
            const hours = column(screen, 'Hours');
            await expect.element(option(hours, '10')).toHaveFocus();
            await expect.element(option(hours, '11')).not.toHaveAttribute('aria-disabled');

            await userEvent.keyboard('{ArrowDown}');
            await expect.element(option(hours, '11')).toHaveFocus();
            await userEvent.keyboard('{Enter}');
            await userEvent.keyboard(' ');
            await option(hours, '14').click();

            expect(onUpdate).not.toHaveBeenCalled();
            await expect.element(option(hours, '10')).toHaveAttribute('aria-selected', 'true');
            // No selection happened, so focus did not go to the next column
            await expect.element(option(hours, '14')).toHaveFocus();
        });

        it('makes every option unavailable when disabled', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection
                    aria-label="Time"
                    value={value}
                    disabled
                    defaultFocusView="hours"
                    onUpdate={onUpdate}
                />,
            );

            await expect
                .element(screen.getByRole('group', {name: 'Time'}))
                .toHaveAttribute('aria-disabled', 'true');
            expect(
                screen
                    .getByRole('option')
                    .elements()
                    .every((element) => element.getAttribute('aria-disabled') === 'true'),
            ).toBe(true);
            expect(document.activeElement).toBe(document.body);

            await option(column(screen, 'Hours'), '14').click({force: true});
            expect(onUpdate).not.toHaveBeenCalled();
        });
    });

    describe('scroll', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('centers the selected option from the middle of the list on mount', async () => {
            const screen = await render(<TimeSelection value={time('2024-01-15T10:30:00')} />);
            const hours = column(screen, 'Hours');
            const gaps = getRowGaps(hours, option(hours, '10'));

            // Seven rows are visible: three above the selected one and three below
            expect(gaps.scrollTop).toBeGreaterThan(0);
            expect(Math.abs(gaps.top - gaps.bottom)).toBeLessThanOrEqual(1);
            expect(hours.element().clientHeight).toBe(
                option(hours, '10').element().clientHeight * 7,
            );
        });

        it('leaves the first and the last option at the edge', async () => {
            const screen = await render(<TimeSelection value={time('2024-01-15T00:59:00')} />);
            const hours = column(screen, 'Hours');
            const minutes = column(screen, 'Minutes');

            const first = getRowGaps(hours, option(hours, '00'));
            expect(first.scrollTop).toBe(0);
            expect(first.top).toBe(0);

            const last = getRowGaps(minutes, option(minutes, '59'));
            expect(last.scrollTop).toBe(last.maxScrollTop);
            expect(Math.abs(last.bottom)).toBeLessThanOrEqual(1);
        });

        it('centers the newly selected option', async () => {
            const screen = await render(<Controlled value={time('2024-01-15T10:30:00')} />);
            const hours = column(screen, 'Hours');
            const initialScrollTop = hours.element().scrollTop;

            await option(hours, '13').click();
            await expect.element(option(hours, '13')).toHaveAttribute('aria-selected', 'true');

            await expect
                .poll(() => {
                    const gaps = getRowGaps(hours, option(hours, '13'));
                    return Math.abs(gaps.top - gaps.bottom);
                })
                .toBeLessThanOrEqual(1);
            expect(hours.element().scrollTop).toBeGreaterThan(initialScrollTop);
        });

        it('scrolls smoothly after the mount and instantly with reduced motion', async () => {
            const scrollTo = vi.spyOn(Element.prototype, 'scrollTo');
            const matchMedia = vi.spyOn(window, 'matchMedia');
            const screen = await render(<Controlled value={time('2024-01-15T10:30:00')} />);
            const hours = column(screen, 'Hours');
            const behaviors = () =>
                scrollTo.mock.calls.map(([options]) => (options as ScrollToOptions).behavior);

            // Hours and minutes on mount
            expect(behaviors()).toEqual(['instant', 'instant']);

            await option(hours, '13').click();
            await expect.element(option(hours, '13')).toHaveAttribute('aria-selected', 'true');
            expect(behaviors()).toEqual(['instant', 'instant', 'smooth']);

            matchMedia.mockImplementation(
                (query) => ({matches: query.includes('prefers-reduced-motion')}) as MediaQueryList,
            );
            await option(hours, '12').click();
            await expect.element(option(hours, '12')).toHaveAttribute('aria-selected', 'true');
            expect(behaviors()).toEqual(['instant', 'instant', 'smooth', 'instant']);
        });

        it('does not scroll back to the option that stays selected', async () => {
            const selected = time('2024-01-15T10:30:00');
            const screen = await render(<TimeSelection value={selected} />);
            const hours = column(screen, 'Hours');

            hours.element().scrollTop = 0;
            await screen.rerender(
                <TimeSelection value={time('2024-01-15T10:45:00')} aria-label="Time" />,
            );
            await expect
                .element(option(column(screen, 'Minutes'), '45'))
                .toHaveAttribute('aria-selected', 'true');

            expect(hours.element().scrollTop).toBe(0);
        });

        it('keeps the keyboard navigation of the list from fighting the centering', async () => {
            const screen = await render(
                <TimeSelection value={time('2024-01-15T10:30:00')} defaultFocusView="hours" />,
            );
            const hours = column(screen, 'Hours');
            await expect.element(option(hours, '10')).toHaveFocus();
            const centered = hours.element().scrollTop;

            // Taking focus and moving within the visible rows leaves the scroll where it is
            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            await expect.element(option(hours, '12')).toHaveFocus();
            expect(hours.element().scrollTop).toBe(centered);

            // Going past the visible rows scrolls by the nearest edge, which is the List's job
            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            await expect.element(option(hours, '14')).toHaveFocus();
            const gaps = getRowGaps(hours, option(hours, '14'));
            expect(Math.abs(gaps.bottom)).toBeLessThanOrEqual(1);
        });
    });
});

describe.skipIf(!import.meta.env.VITE_CI).each([['light'], ['dark']])(
    'Visual tests [%s]',
    (theme) => {
        const options = {providers: {theme}};
        const selected = time('2024-01-15T10:30:45');

        test('default view', async () => {
            const screen = await render(
                <TimeSelection data-qa="time-selection" value={selected} />,
                options,
            );
            await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
        });

        test('with seconds', async () => {
            const screen = await render(
                <TimeSelection
                    data-qa="time-selection"
                    value={selected}
                    views={['hours', 'minutes', 'seconds']}
                />,
                options,
            );
            await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
        });

        test('with ampm', async () => {
            const screen = await render(
                <TimeSelection
                    data-qa="time-selection"
                    value={time('2024-01-15T15:30:45')}
                    views={['hours', 'minutes', 'seconds']}
                    ampm
                />,
                options,
            );
            await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
        });

        test('with unavailable options', async () => {
            const screen = await render(
                <TimeSelection
                    data-qa="time-selection"
                    value={selected}
                    minValue={time('2024-01-15T09:28:00')}
                    maxValue={time('2024-01-15T11:31:00')}
                />,
                options,
            );
            await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
        });

        test('sizes', async () => {
            const screen = await render(
                <div data-qa="time-selection" style={{display: 'flex', gap: 16}}>
                    <TimeSelection size="s" value={selected} ampm />
                    <TimeSelection size="m" value={selected} ampm />
                    <TimeSelection size="l" value={selected} ampm />
                    <TimeSelection size="xl" value={selected} ampm />
                </div>,
                options,
            );
            await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
        });
    },
);
