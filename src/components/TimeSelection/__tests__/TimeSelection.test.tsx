import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, describe, expect, it, test, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import type {Locator} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {TimeSelection} from '../TimeSelection';
import type {TimeSelectionProps, TimeSelectionView} from '../types';

type Scope = {getByRole: Locator['getByRole']};
type Mock = ReturnType<typeof vi.fn>;

const FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const MS_FORMAT = `${FORMAT}.SSS`;

function time(input: string) {
    return dateTime({input: `${input}Z`, timeZone: 'UTC'});
}

const value = time('2024-01-15T10:30:45');

function column(scope: Scope, name: string) {
    return scope.getByRole('listbox', {name, exact: true});
}

function option(scope: Scope, columnName: string, name: string) {
    return column(scope, columnName).getByRole('option', {name, exact: true});
}

function optionLabels(scope: Scope, columnName: string) {
    return column(scope, columnName)
        .getByRole('option')
        .elements()
        .map((element) => element.textContent);
}

function columnLabels(scope: Scope) {
    return scope
        .getByRole('listbox')
        .elements()
        .map((element) => element.getAttribute('aria-label'));
}

function selectedLabels(scope: Scope) {
    return scope
        .getByRole('option')
        .elements()
        .filter((element) => element.getAttribute('aria-selected') === 'true')
        .map((element) => element.textContent);
}

function allDisabled(scope: Scope) {
    return scope
        .getByRole('option')
        .elements()
        .every((element) => element.getAttribute('aria-disabled') === 'true');
}

function isDisabled(scope: Scope, columnName: string, name: string) {
    return option(scope, columnName, name).element().getAttribute('aria-disabled') === 'true';
}

/** The column and the option that hold DOM focus, like `Hours 10` */
function focused() {
    const element = document.activeElement;
    const list = element?.closest('[role="listbox"]');
    return list ? `${list.getAttribute('aria-label')} ${element?.textContent}` : null;
}

function lastValue(onUpdate: Mock, format = FORMAT) {
    return (onUpdate.mock.lastCall?.[0] as DateTime).format(format);
}

/** The distance from the row to the top and to the bottom edge of the visible part of its column */
function getRowGaps(scope: Scope, columnName: string, name: string) {
    const container = column(scope, columnName).element();
    const containerRect = container.getBoundingClientRect();
    const rowRect = option(scope, columnName, name).element().getBoundingClientRect();
    return {
        bottom: containerRect.bottom - rowRect.bottom,
        maxScrollTop: container.scrollHeight - container.clientHeight,
        scrollTop: container.scrollTop,
        top: rowRect.top - containerRect.top,
    };
}

function isCentered(scope: Scope, columnName: string, name: string) {
    const gaps = getRowGaps(scope, columnName, name);
    return gaps.scrollTop > 0 && Math.abs(gaps.top - gaps.bottom) <= 1;
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
            expect(columnLabels(screen)).toEqual(['Hours', 'Minutes']);

            const hours = optionLabels(screen, 'Hours');
            expect(hours).toHaveLength(24);
            expect(hours.slice(0, 3)).toEqual(['00', '01', '02']);
            expect(hours[23]).toBe('23');
            expect(optionLabels(screen, 'Minutes')).toHaveLength(60);
        });

        it.each<[TimeSelectionView[], boolean, string[]]>([
            [['seconds', 'hours', 'minutes'], true, ['Hours', 'Minutes', 'Seconds', 'AM/PM']],
            [
                ['milliseconds', 'seconds', 'hours', 'minutes'],
                true,
                ['Hours', 'Minutes', 'Seconds', 'Milliseconds', 'AM/PM'],
            ],
            [['seconds'], false, ['Seconds']],
            [[], false, []],
            [[], true, ['AM/PM']],
        ])(
            'renders the columns of views %j with ampm %s in a fixed order',
            async (views, ampm, labels) => {
                const screen = await render(
                    <TimeSelection
                        aria-label="Time"
                        value={value}
                        views={views}
                        ampm={ampm}
                        timeSteps={{milliseconds: 100}}
                    />,
                );

                await expect.element(screen.getByRole('group', {name: 'Time'})).toBeInTheDocument();
                expect(columnLabels(screen)).toEqual(labels);
            },
        );

        it('shows the 12-hour clock with ampm', async () => {
            const screen = await render(<TimeSelection value={time('2024-01-15T15:30:00')} ampm />);

            expect(optionLabels(screen, 'Hours').join(' ')).toBe(
                '12 01 02 03 04 05 06 07 08 09 10 11',
            );
            expect(optionLabels(screen, 'AM/PM')).toEqual(['AM', 'PM']);
            expect(selectedLabels(screen)).toEqual(['03', '30', 'PM']);
        });

        it.each([
            ['2024-01-15T00:05:00', 'AM'],
            ['2024-01-15T12:05:00', 'PM'],
        ])('selects 12 for %s with ampm', async (input, meridiem) => {
            const screen = await render(<TimeSelection value={time(input)} ampm />);

            expect(selectedLabels(screen)).toEqual(['12', '05', meridiem]);
        });

        it('changes the hour and the half of the day separately with ampm', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <Controlled value={time('2024-01-15T15:30:00')} ampm onUpdate={onUpdate} />,
            );

            await option(screen, 'Hours', '12').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T12:30:00');

            await option(screen, 'Hours', '05').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T17:30:00');

            await option(screen, 'AM/PM', 'AM').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T05:30:00');
        });

        it('labels the columns in the language of the provider', async () => {
            const screen = await render(
                <TimeSelection
                    value={value}
                    views={['hours', 'minutes', 'seconds', 'milliseconds']}
                    timeSteps={{milliseconds: 100}}
                    ampm
                />,
                {providers: {lang: 'ru'}},
            );

            expect(columnLabels(screen)).toEqual([
                'Часы',
                'Минуты',
                'Секунды',
                'Миллисекунды',
                'AM/PM',
            ]);
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

            expect(optionLabels(screen, 'Hours')).toEqual(['00', '06', '12', '18']);
            expect(optionLabels(screen, 'Minutes')).toEqual(['00', '15', '30', '45']);
            expect(optionLabels(screen, 'Seconds')).toHaveLength(60);
        });

        it('selects nothing in a column when the value does not fit its step', async () => {
            const screen = await render(
                <TimeSelection value={time('2024-01-15T10:20:00')} timeSteps={{minutes: 15}} />,
            );

            expect(selectedLabels(screen)).toEqual(['10']);
        });

        it('falls back to the step of 1 for invalid steps', async () => {
            const screen = await render(
                <TimeSelection value={value} timeSteps={{hours: -2, minutes: 0}} />,
            );

            expect(optionLabels(screen, 'Hours')).toHaveLength(24);
            expect(optionLabels(screen, 'Minutes')).toHaveLength(60);
        });
    });

    describe('selection', () => {
        it('marks the options of the value as selected', async () => {
            const screen = await render(
                <TimeSelection value={value} views={['hours', 'minutes', 'seconds']} />,
            );

            expect(selectedLabels(screen)).toEqual(['10', '30', '45']);
            expect(selectedLabels(column(screen, 'Hours'))).not.toContain('11');
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

            await option(screen, 'Hours', '14').click();
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(lastValue(onUpdate)).toBe('2024-01-15T14:30:45');

            await option(screen, 'Minutes', '05').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:05:45');

            await option(screen, 'Seconds', '00').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:30:00');
        });

        it('works uncontrolled with defaultValue', async () => {
            const onUpdate = vi.fn();
            const screen = await render(<TimeSelection defaultValue={value} onUpdate={onUpdate} />);

            await option(screen, 'Hours', '14').click();
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['14']);

            await option(screen, 'Minutes', '05').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T14:05:45');
        });

        it('does not report the value that is already selected', async () => {
            const onUpdate = vi.fn();
            const screen = await render(<TimeSelection value={value} onUpdate={onUpdate} />);

            await option(screen, 'Hours', '10').click();
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('selects nothing while the value is null and starts from the placeholder', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <Controlled
                    value={null}
                    placeholderValue={time('2024-03-10T08:15:20')}
                    onUpdate={onUpdate}
                />,
            );
            expect(selectedLabels(screen)).toEqual([]);

            await option(screen, 'Hours', '09').click();
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(lastValue(onUpdate)).toBe('2024-03-10T09:15:20');
            // The next column is entered at the unit the placeholder has just filled
            await expect.poll(focused).toBe('Minutes 15');
        });

        it('uses today at midnight when there is neither a value nor a placeholder', async () => {
            const onUpdate = vi.fn();
            const screen = await render(<TimeSelection timeZone="UTC" onUpdate={onUpdate} />);
            const today = dateTime({timeZone: 'UTC'}).format('YYYY-MM-DD');

            await option(screen, 'Hours', '07').click();
            const next = onUpdate.mock.calls[0][0] as DateTime;
            expect(next.timeZone('UTC').format(FORMAT)).toBe(`${today}T07:00:00`);
        });

        it('shows the value in the given time zone and keeps the time zone of the value', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection value={value} timeZone="Asia/Tokyo" onUpdate={onUpdate} />,
            );

            // 10:30 UTC is 19:30 in Tokyo
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['19']);

            await option(screen, 'Hours', '20').click();
            const next = onUpdate.mock.calls[0][0] as DateTime;
            expect(next.timeZone()).toBe('UTC');
            expect(next.format(FORMAT)).toBe('2024-01-15T11:30:45');
        });
    });

    describe('milliseconds', () => {
        const withMs = time('2024-01-15T10:30:45.250');
        const views: TimeSelectionView[] = ['hours', 'minutes', 'seconds', 'milliseconds'];

        it('renders three-digit options by the step', async () => {
            const screen = await render(
                <TimeSelection value={withMs} views={views} timeSteps={{milliseconds: 50}} />,
            );

            const milliseconds = optionLabels(screen, 'Milliseconds');
            expect(milliseconds).toHaveLength(20);
            expect(milliseconds.slice(0, 3)).toEqual(['000', '050', '100']);
            expect(milliseconds[19]).toBe('950');
            await expect
                .poll(() => selectedLabels(column(screen, 'Milliseconds')))
                .toEqual(['250']);
        });

        it('changes only milliseconds and keeps them when another unit is picked', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <Controlled
                    value={withMs}
                    views={views}
                    timeSteps={{milliseconds: 50}}
                    onUpdate={onUpdate}
                />,
            );

            await option(screen, 'Milliseconds', '700').click();
            expect(lastValue(onUpdate, MS_FORMAT)).toBe('2024-01-15T10:30:45.700');

            await option(screen, 'Hours', '08').click();
            expect(lastValue(onUpdate, MS_FORMAT)).toBe('2024-01-15T08:30:45.700');
        });

        it('disables the milliseconds out of minValue and maxValue', async () => {
            const screen = await render(
                <TimeSelection
                    value={withMs}
                    views={views}
                    timeSteps={{milliseconds: 50}}
                    minValue={time('2024-01-15T10:30:45.200')}
                    maxValue={time('2024-01-15T10:30:45.300')}
                />,
            );

            expect(isDisabled(screen, 'Milliseconds', '150')).toBe(true);
            expect(isDisabled(screen, 'Milliseconds', '200')).toBe(false);
            expect(isDisabled(screen, 'Milliseconds', '300')).toBe(false);
            expect(isDisabled(screen, 'Milliseconds', '350')).toBe(true);
            // The second still has a moment in range
            expect(isDisabled(screen, 'Seconds', '45')).toBe(false);
            expect(isDisabled(screen, 'Seconds', '46')).toBe(true);
        });
    });

    describe('keyboard', () => {
        it('moves the active option with the keys of the List without changing the value', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <TimeSelection value={value} defaultFocusView="hours" onUpdate={onUpdate} />,
            );
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.keyboard('{ArrowDown}');
            await expect.poll(focused).toBe('Hours 11');
            await userEvent.keyboard('{End}');
            await expect.poll(focused).toBe('Hours 23');
            await userEvent.keyboard('{Home}');
            await expect.poll(focused).toBe('Hours 00');
            await userEvent.keyboard('17');
            await expect.poll(focused).toBe('Hours 17');

            expect(onUpdate).not.toHaveBeenCalled();
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['10']);
        });

        it('selects the active option with Enter and moves focus to the next column', async () => {
            const onUpdate = vi.fn();
            const onFocusViewUpdate = vi.fn();
            await render(
                <Controlled
                    value={value}
                    defaultFocusView="hours"
                    onUpdate={onUpdate}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.keyboard('{Enter}');
            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(lastValue(onUpdate)).toBe('2024-01-15T12:30:45');
            await expect.poll(focused).toBe('Minutes 30');
            expect(onFocusViewUpdate).toHaveBeenCalledTimes(1);
            expect(onFocusViewUpdate).toHaveBeenLastCalledWith('minutes');
        });

        it('selects with Space and keeps focus in the last column', async () => {
            const onUpdate = vi.fn();
            const onFocusViewUpdate = vi.fn();
            await render(
                <Controlled
                    value={value}
                    defaultFocusView="minutes"
                    onUpdate={onUpdate}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );
            await expect.poll(focused).toBe('Minutes 30');

            await userEvent.keyboard('{ArrowDown}');
            await userEvent.keyboard(' ');
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:31:45');
            await expect.poll(focused).toBe('Minutes 31');
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

            await option(screen, 'Hours', '08').click();
            await expect.poll(focused).toBe('Minutes 30');
            expect(onFocusViewUpdate.mock.calls.map(([view]) => view)).toEqual([
                'hours',
                'minutes',
            ]);
        });

        it('moves between the columns with left and right arrows without wrapping', async () => {
            const onUpdate = vi.fn();
            const onFocusViewUpdate = vi.fn();
            await render(
                <TimeSelection
                    value={value}
                    ampm
                    defaultFocusView="hours"
                    onUpdate={onUpdate}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.keyboard('{ArrowLeft}');
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.keyboard('{ArrowDown}{ArrowRight}');
            await expect.poll(focused).toBe('Minutes 30');
            expect(onFocusViewUpdate).toHaveBeenLastCalledWith('minutes');

            // The AM/PM column takes focus but is not a view
            await userEvent.keyboard('{ArrowRight}');
            await expect.poll(focused).toBe('AM/PM AM');
            expect(onFocusViewUpdate).toHaveBeenCalledTimes(1);

            await userEvent.keyboard('{ArrowRight}');
            await expect.poll(focused).toBe('AM/PM AM');

            // Hours are entered at the selected option, not at the one left active
            await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
            await expect.poll(focused).toBe('Hours 10');
            expect(onFocusViewUpdate.mock.calls.map(([view]) => view)).toEqual([
                'minutes',
                'hours',
            ]);
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('moves between the columns with Tab', async () => {
            const screen = await render(
                <div>
                    <TimeSelection value={value} defaultFocusView="hours" />
                    <button type="button">After</button>
                </div>,
            );
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.keyboard('{ArrowDown}{Tab}');
            await expect.poll(focused).toBe('Minutes 30');
            await userEvent.keyboard('{Tab}');
            await expect.element(screen.getByRole('button', {name: 'After'})).toHaveFocus();
            // The option left active in hours is dropped when focus leaves the column
            await userEvent.keyboard('{Shift>}{Tab}{Tab}{/Shift}');
            await expect.poll(focused).toBe('Hours 10');
        });

        it('enters a column at its selected option after the pointer has been over it', async () => {
            const screen = await render(<TimeSelection value={value} defaultFocusView="hours" />);
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.hover(option(screen, 'Minutes', '33'));
            await userEvent.hover(option(screen, 'Hours', '10'));
            await userEvent.keyboard('{Tab}');
            await expect.poll(focused).toBe('Minutes 30');
        });

        it('swaps left and right arrows in RTL', async () => {
            await render(<TimeSelection value={value} defaultFocusView="hours" />, {
                wrapper: ({children}) => <ThemeProvider direction="rtl">{children}</ThemeProvider>,
            });
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.keyboard('{ArrowRight}');
            await expect.poll(focused).toBe('Hours 10');
            await userEvent.keyboard('{ArrowLeft}');
            await expect.poll(focused).toBe('Minutes 30');
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
            await render(
                <TimeSelection
                    value={value}
                    defaultFocusView="minutes"
                    onFocus={onFocus}
                    onFocusViewUpdate={onFocusViewUpdate}
                />,
            );

            await expect.poll(focused).toBe('Minutes 30');
            expect(onFocus).toHaveBeenCalledTimes(1);
            // The consumer asked for this view itself
            expect(onFocusViewUpdate).not.toHaveBeenCalled();
        });

        it('focuses the first option when nothing is selected', async () => {
            await render(<TimeSelection value={null} defaultFocusView="hours" />);

            await expect.poll(focused).toBe('Hours 00');
        });

        it('moves focus when focusedView changes', async () => {
            const onFocusViewUpdate = vi.fn();
            const props = {
                onFocusViewUpdate,
                value,
                views: ['hours', 'minutes', 'seconds'] as TimeSelectionView[],
            };
            const screen = await render(<TimeSelection {...props} focusedView="hours" />);
            await expect.poll(focused).toBe('Hours 10');

            await screen.rerender(<TimeSelection {...props} focusedView="seconds" />);
            await expect.poll(focused).toBe('Seconds 45');
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
            await expect.poll(focused).toBe('Hours 10');

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
                    minValue={time('2024-01-15T10:20:30')}
                    maxValue={time('2024-01-15T18:00:00')}
                />,
            );

            expect(isDisabled(screen, 'Hours', '09')).toBe(true);
            // A part of the hour is still in range
            expect(isDisabled(screen, 'Hours', '10')).toBe(false);
            expect(isDisabled(screen, 'Hours', '18')).toBe(false);
            expect(isDisabled(screen, 'Hours', '19')).toBe(true);

            expect(isDisabled(screen, 'Minutes', '19')).toBe(true);
            // A part of the minute is still in range
            expect(isDisabled(screen, 'Minutes', '20')).toBe(false);
            expect(isDisabled(screen, 'Minutes', '59')).toBe(false);
        });

        it('disables every option when the date is out of range', async () => {
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:00')}
                    minValue={time('2024-01-16T00:00:00')}
                />,
            );

            expect(allDisabled(screen)).toBe(true);
        });

        it('disables a half of the day that is out of range', async () => {
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T10:30:00')}
                    ampm
                    maxValue={time('2024-01-15T11:00:00')}
                />,
            );

            expect(isDisabled(screen, 'AM/PM', 'AM')).toBe(false);
            expect(isDisabled(screen, 'AM/PM', 'PM')).toBe(true);
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

            await option(screen, 'Hours', '10').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T10:20:00');
            // Focus goes to the minute the pick has selected, not to the one selected before it
            await expect.poll(() => selectedLabels(column(screen, 'Minutes'))).toEqual(['20']);
            await expect.poll(focused).toBe('Minutes 20');

            await option(screen, 'Hours', '18').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T18:05:00');
        });

        it('keeps a picked half of the day within minValue and maxValue', async () => {
            const onUpdate = vi.fn();
            const screen = await render(
                <Controlled
                    value={time('2024-01-15T09:30:00')}
                    ampm
                    maxValue={time('2024-01-15T21:10:00')}
                    onUpdate={onUpdate}
                />,
            );

            await option(screen, 'AM/PM', 'PM').click();
            expect(lastValue(onUpdate)).toBe('2024-01-15T21:10:00');
        });

        it('compares minValue and maxValue in the shown time zone', async () => {
            const screen = await render(
                <TimeSelection
                    value={value}
                    timeZone="Asia/Tokyo"
                    minValue={time('2024-01-15T09:00:00')}
                />,
            );

            // 09:00 UTC is 18:00 in Tokyo
            expect(isDisabled(screen, 'Hours', '17')).toBe(true);
            expect(isDisabled(screen, 'Hours', '18')).toBe(false);
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
            await expect.poll(focused).toBe('Hours 10');

            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            await expect.poll(focused).toBe('Hours 12');
            await userEvent.keyboard('{Home}');
            await expect.poll(focused).toBe('Hours 10');

            await option(screen, 'Hours', '09').click({force: true});
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it('disables the options isTimeUnavailable rejects', async () => {
            const isTimeUnavailable = vi.fn(
                (date: DateTime, view: TimeSelectionView) =>
                    (view === 'hours' && date.hour() === 13) ||
                    (view === 'minutes' && date.minute() % 2 === 1),
            );
            const screen = await render(
                <TimeSelection value={value} isTimeUnavailable={isTimeUnavailable} />,
            );

            expect(isDisabled(screen, 'Hours', '13')).toBe(true);
            expect(isDisabled(screen, 'Hours', '12')).toBe(false);
            expect(isDisabled(screen, 'Minutes', '31')).toBe(true);
            expect(isDisabled(screen, 'Minutes', '32')).toBe(false);

            // The callback gets the value with the unit of the option put into it
            const hourCall = isTimeUnavailable.mock.calls.find(
                ([date, view]) => view === 'hours' && date.hour() === 13,
            );
            expect(hourCall?.[0].format(FORMAT)).toBe('2024-01-15T13:30:45');
        });

        it('checks an AM/PM option as the hour it gives', async () => {
            const screen = await render(
                <TimeSelection
                    value={time('2024-01-15T01:30:00')}
                    ampm
                    isTimeUnavailable={(date, view) => view === 'hours' && date.hour() === 13}
                />,
            );

            expect(isDisabled(screen, 'AM/PM', 'PM')).toBe(true);
            expect(isDisabled(screen, 'AM/PM', 'AM')).toBe(false);
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
            await expect.poll(focused).toBe('Hours 10');
            await expect.element(column(screen, 'Hours')).toHaveAttribute('aria-readonly', 'true');
            expect(isDisabled(screen, 'Hours', '11')).toBe(false);

            await userEvent.keyboard('{ArrowDown}');
            await expect.poll(focused).toBe('Hours 11');
            await userEvent.keyboard('{Enter}');
            await userEvent.keyboard(' ');
            await option(screen, 'Hours', '14').click();

            expect(onUpdate).not.toHaveBeenCalled();
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['10']);
            // No selection happened, so focus did not go to the next column
            await expect.poll(focused).toBe('Hours 14');
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
            expect(allDisabled(screen)).toBe(true);
            expect(document.activeElement).toBe(document.body);

            await option(screen, 'Hours', '14').click({force: true});
            expect(onUpdate).not.toHaveBeenCalled();
        });
    });

    describe('scroll', () => {
        const middle = time('2024-01-15T10:30:00');

        function spyOnScroll() {
            const scrollTo = vi.spyOn(Element.prototype, 'scrollTo');
            return () =>
                scrollTo.mock.calls.map(([options]) => (options as ScrollToOptions).behavior);
        }

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('centers the selected option from the middle of the list on mount', async () => {
            const screen = await render(<TimeSelection value={middle} />);

            expect(isCentered(screen, 'Hours', '10')).toBe(true);
            // Seven rows are visible: three above the selected one and three below
            expect(column(screen, 'Hours').element().clientHeight).toBe(
                option(screen, 'Hours', '10').element().clientHeight * 7,
            );
        });

        it('leaves the first and the last option at the edge', async () => {
            const screen = await render(<TimeSelection value={time('2024-01-15T00:59:00')} />);

            const first = getRowGaps(screen, 'Hours', '00');
            expect(first.scrollTop).toBe(0);
            expect(first.top).toBe(0);

            const last = getRowGaps(screen, 'Minutes', '59');
            expect(last.scrollTop).toBe(last.maxScrollTop);
            expect(Math.abs(last.bottom)).toBeLessThanOrEqual(1);
        });

        it('centers the newly selected option', async () => {
            const screen = await render(<Controlled value={middle} />);

            await option(screen, 'Hours', '13').click();
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['13']);
            await expect.poll(() => isCentered(screen, 'Hours', '13')).toBe(true);
        });

        it('scrolls smoothly after the mount and instantly with reduced motion', async () => {
            const behaviors = spyOnScroll();
            const matchMedia = vi.spyOn(window, 'matchMedia');
            const screen = await render(<Controlled value={middle} />);

            // Hours and minutes on mount
            expect(behaviors()).toEqual(['instant', 'instant']);

            await option(screen, 'Hours', '13').click();
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['13']);
            expect(behaviors()).toEqual(['instant', 'instant', 'smooth']);

            matchMedia.mockImplementation(
                (query) => ({matches: query.includes('prefers-reduced-motion')}) as MediaQueryList,
            );
            await option(screen, 'Hours', '12').click();
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['12']);
            expect(behaviors()).toEqual(['instant', 'instant', 'smooth', 'instant']);
        });

        it('does not scroll back to the option that stays selected', async () => {
            const screen = await render(<TimeSelection value={middle} />);
            const hours = column(screen, 'Hours').element();

            hours.scrollTop = 0;
            await screen.rerender(<TimeSelection value={time('2024-01-15T10:45:00')} />);
            await expect.poll(() => selectedLabels(column(screen, 'Minutes'))).toEqual(['45']);
            expect(hours.scrollTop).toBe(0);

            // A resize is not a reason to scroll back either
            await screen.rerender(
                <TimeSelection value={time('2024-01-15T10:45:00')} style={{height: 120}} />,
            );
            await expect.poll(() => hours.clientHeight).toBe(120);
            await new Promise((resolve) => requestAnimationFrame(resolve));
            expect(hours.scrollTop).toBe(0);
        });

        it('does not animate the first centering of a column that was hidden', async () => {
            const behaviors = spyOnScroll();
            const screen = await render(
                <div style={{display: 'none'}}>
                    <TimeSelection value={middle} />
                </div>,
            );
            expect(behaviors()).toEqual([]);

            // The columns appear, and the selection of one of them changes in the same render
            await screen.rerender(
                <div>
                    <TimeSelection value={time('2024-01-15T13:30:00')} />
                </div>,
            );
            await expect.poll(() => behaviors()).toEqual(['instant', 'instant']);
            expect(isCentered(screen, 'Hours', '13')).toBe(true);
            expect(isCentered(screen, 'Minutes', '30')).toBe(true);
        });

        it('animates the first selection in a column that was already visible', async () => {
            const behaviors = spyOnScroll();
            const screen = await render(<Controlled value={null} />);

            await option(screen, 'Hours', '05').click();
            await expect.poll(() => selectedLabels(column(screen, 'Hours'))).toEqual(['05']);
            expect(behaviors()).toEqual(['smooth', 'smooth']);
        });

        it('takes the height of the columns from the outside', async () => {
            const screen = await render(<TimeSelection value={middle} style={{height: 100}} />);

            expect(column(screen, 'Hours').element().clientHeight).toBe(100);
        });

        it('keeps the scroll while the active option moves within the visible rows', async () => {
            const screen = await render(<TimeSelection value={middle} defaultFocusView="hours" />);
            const hours = column(screen, 'Hours').element();
            await expect.poll(focused).toBe('Hours 10');
            const centered = hours.scrollTop;

            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            await expect.poll(focused).toBe('Hours 12');
            expect(hours.scrollTop).toBe(centered);
        });
    });
});

describe.skipIf(!import.meta.env.VITE_CI)('Visual tests', () => {
    // The pointer rests where an earlier test left it: without this a row under it gets hovered
    const still = {pointerEvents: 'none'} as const;
    const views: TimeSelectionView[] = ['hours', 'minutes', 'seconds'];

    test('default view', async () => {
        const screen = await render(
            <TimeSelection data-qa="time-selection" style={still} value={value} />,
        );
        await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
    });

    test('with seconds', async () => {
        const screen = await render(
            <TimeSelection data-qa="time-selection" style={still} value={value} views={views} />,
        );
        await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
    });

    test('with ampm', async () => {
        const screen = await render(
            <TimeSelection
                data-qa="time-selection"
                style={still}
                value={time('2024-01-15T15:30:45')}
                views={views}
                ampm
            />,
        );
        await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
    });

    test('with milliseconds', async () => {
        const screen = await render(
            <TimeSelection
                data-qa="time-selection"
                style={still}
                value={time('2024-01-15T10:30:45.250')}
                views={[...views, 'milliseconds']}
                timeSteps={{milliseconds: 50}}
            />,
        );
        await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
    });

    test('with unavailable options', async () => {
        const screen = await render(
            <TimeSelection
                data-qa="time-selection"
                style={still}
                value={value}
                minValue={time('2024-01-15T09:28:00')}
                maxValue={time('2024-01-15T11:31:00')}
            />,
        );
        await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
    });

    test('sizes', async () => {
        const screen = await render(
            <div data-qa="time-selection" style={{...still, display: 'inline-flex', gap: 16}}>
                <TimeSelection size="s" value={value} ampm />
                <TimeSelection size="m" value={value} ampm />
                <TimeSelection size="l" value={value} ampm />
                <TimeSelection size="xl" value={value} ampm />
            </div>,
        );
        await expect(screen.getByTestId('time-selection')).toMatchScreenshot();
    });
});
