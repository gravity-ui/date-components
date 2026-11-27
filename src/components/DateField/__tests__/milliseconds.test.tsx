import {dateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render, renderHook} from '#test-utils/utils';

import {useCalendarState} from '../../CalendarView/hooks/useCalendarState';
import {useRangeCalendarState} from '../../CalendarView/hooks/useRangeCalendarState';
import {MobileCalendar} from '../../DatePicker/MobileCalendar';
import {useDatePickerState} from '../../DatePicker/hooks/useDatePickerState';
import {RangeDateField} from '../../RangeDateField';
import {useRangeDatePickerState} from '../../RangeDatePicker/hooks/useRangeDatePickerState';
import {useRelativeDatePickerState} from '../../RelativeDatePicker/hooks/useRelativeDatePickerState';
import {mergeDateTime} from '../../utils/dates';
import {DateField} from '../DateField';
import {IncompleteDate} from '../IncompleteDate';
import {
    adjustDateToFormat,
    cleanString,
    getFormatInfo,
    parseDateFromString,
    splitFormatIntoSections,
} from '../utils';

function inputValue(element: Element) {
    expect(element).toBeInstanceOf(HTMLInputElement);
    return element instanceof HTMLInputElement ? cleanString(element.value) : '';
}

const format = 'YYYY-MM-DD HH:mm:ss.SSS';
const value = dateTime({input: '2024-06-15T12:34:56.123Z', timeZone: 'UTC'});

describe('millisecond precision', () => {
    it('recognizes SSS as an editable time unit with leading zeros', () => {
        const sections = splitFormatIntoSections(format);
        expect(sections.at(-1)).toMatchObject({
            type: 'millisecond',
            contentType: 'digit',
            hasLeadingZeros: true,
            placeholder: 'SSS',
        });
        expect(getFormatInfo(sections)).toMatchObject({hasTime: true, minTimeUnit: 'millisecond'});
    });

    it('round-trips incomplete dates and requires the millisecond segment', () => {
        const units = getFormatInfo(splitFormatIntoSections(format)).availableUnits;
        const incomplete = new IncompleteDate(value);
        expect(
            incomplete
                .copy()
                .toDateTime(value.startOf('day'), {setDate: true, setTime: true})
                .valueOf(),
        ).toBe(value.valueOf());
        expect(incomplete.clear('millisecond').isComplete(units)).toBe(false);
    });

    it('merges milliseconds with the time and preserves format precision', () => {
        expect(mergeDateTime(value.startOf('day'), value).valueOf()).toBe(value.valueOf());
        expect(
            adjustDateToFormat(value, getFormatInfo(splitFormatIntoSections(format))).valueOf(),
        ).toBe(value.valueOf());
        expect(
            adjustDateToFormat(
                value,
                getFormatInfo(splitFormatIntoSections('HH:mm:ss')),
            ).millisecond(),
        ).toBe(0);
        expect(
            adjustDateToFormat(
                value,
                getFormatInfo(splitFormatIntoSections('HH:mm:ss')),
                'endOf',
            ).millisecond(),
        ).toBe(999);
    });

    it('parses milliseconds in an explicit time zone', () => {
        expect(
            parseDateFromString('2024-06-15 12:34:56.007', format, 'Europe/Berlin').format(format),
        ).toBe('2024-06-15 12:34:56.007');
    });

    it('edits three digits, wraps with arrows, and clears the segment', async () => {
        const onUpdate = vi.fn();
        const screen = await render(
            <DateField defaultValue={value} format={format} onUpdate={onUpdate} />,
        );
        const input = screen.getByRole('textbox');
        await userEvent.keyboard('{Tab}');
        // On focus the field reads the selected section from the DOM in a timeout: keys sent
        // before it fires are applied to a section that is then reset. Wait for the year section
        await expect
            .poll(() => {
                const element = input.element() as HTMLInputElement;
                return cleanString(
                    element.value.slice(element.selectionStart ?? 0, element.selectionEnd ?? 0),
                );
            })
            .toBe('2024');
        await userEvent.keyboard(
            '{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}007',
        );
        expect(inputValue(input.element())).toBe('2024-06-15 12:34:56.007');
        expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(7);
        await userEvent.keyboard('{End}{ArrowUp}');
        expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(0);
        await userEvent.keyboard('{ArrowDown}');
        expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(999);
        await userEvent.keyboard('{PageUp}');
        expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(99);
        await userEvent.keyboard('{PageDown}');
        expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(999);
        await userEvent.keyboard('{Delete}{Delete}{Delete}');
        expect(inputValue(input.element())).toContain('.SSS');
    });

    it('renders milliseconds in both range endpoints', async () => {
        const screen = await render(
            <RangeDateField
                defaultValue={{start: value, end: value.add(1, 'millisecond')}}
                format={format}
            />,
        );
        expect(inputValue(screen.getByRole('textbox').element())).toContain('56.123');
        expect(inputValue(screen.getByRole('textbox').element())).toContain('56.124');
    });

    it('keeps both range endpoints exact when editing milliseconds', async () => {
        const onUpdate = vi.fn();
        const screen = await render(
            <RangeDateField
                defaultValue={{start: value, end: value.add(1, 'second')}}
                format={format}
                onUpdate={onUpdate}
            />,
        );
        await screen.getByRole('textbox').click();
        await userEvent.keyboard('{ArrowLeft}'.repeat(14));
        await userEvent.keyboard('{ArrowRight}'.repeat(6) + '007');
        expect(onUpdate.mock.lastCall?.[0].start.millisecond()).toBe(7);
        expect(onUpdate.mock.lastCall?.[0].end.millisecond()).toBe(123);
        await userEvent.keyboard(
            '{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}456',
        );
        expect(onUpdate.mock.lastCall?.[0].end.millisecond()).toBe(456);
    });

    it('preserves milliseconds when selecting range dates', async () => {
        const {result, act} = await renderHook(() =>
            useRangeDatePickerState({
                defaultValue: {start: value, end: value.add(1, 'millisecond')},
                format,
            }),
        );
        expect(result.current.timeFormat).toBe('HH:mm:ss.SSS');
        act(() =>
            result.current.setDateValue({start: value.add(1, 'day'), end: value.add(2, 'day')}),
        );
        expect(result.current.value?.start.millisecond()).toBe(123);
        expect(result.current.value?.end.millisecond()).toBe(124);
    });

    it('preserves milliseconds when standalone calendars select another day', async () => {
        const single = await renderHook(() => useCalendarState({defaultValue: value}));
        single.act(() => single.result.current.selectDate(value.add(1, 'day').startOf('day')));
        expect(single.result.current.value?.valueOf()).toBe(value.add(1, 'day').valueOf());

        const range = await renderHook(() =>
            useRangeCalendarState({
                defaultValue: {start: value, end: value.add(1, 'millisecond')},
            }),
        );
        range.act(() => range.result.current.selectDate(value.add(1, 'day').startOf('day')));
        range.act(() => range.result.current.selectDate(value.add(2, 'day').startOf('day')));
        expect(range.result.current.value?.start.valueOf()).toBe(value.add(1, 'day').valueOf());
        expect(range.result.current.value?.end.valueOf()).toBe(
            value.add(2, 'day').add(1, 'millisecond').valueOf(),
        );
    });

    it('keeps second-precision range rounding unchanged', async () => {
        const onUpdate = vi.fn();
        await render(
            <RangeDateField
                defaultValue={{start: value, end: value.add(1, 'second')}}
                format="HH:mm:ss"
                onUpdate={onUpdate}
            />,
        );
        await userEvent.keyboard('{Tab}{ArrowRight}{ArrowRight}{ArrowUp}');
        expect(onUpdate.mock.lastCall?.[0].start.millisecond()).toBe(0);
        expect(onUpdate.mock.lastCall?.[0].end.millisecond()).toBe(999);
    });

    it('does not round up absolute milliseconds in a relative picker', async () => {
        const {result, act} = await renderHook(() =>
            useRelativeDatePickerState({
                defaultValue: {type: 'absolute', value},
                format,
                roundUp: true,
            }),
        );
        act(() => result.current.datePickerState.setTimeValue(value.millisecond(7)));
        expect(result.current.selectedDate?.millisecond()).toBe(7);
    });

    it.each(['HH:mm:ss.SSS', format])(
        'supports milliseconds in native mobile inputs with %s',
        async (nativeFormat) => {
            const onUpdate = vi.fn();
            function NativeInput() {
                const props = {
                    defaultValue: value,
                    placeholderValue: value,
                    format: nativeFormat,
                    timeZone: 'UTC',
                    onUpdate,
                };
                const state = useDatePickerState(props);
                return <MobileCalendar props={props} state={state} />;
            }
            const screen = await render(<NativeInput />);
            const input = screen.container.querySelector('input');
            if (!(input instanceof HTMLInputElement)) {
                throw new Error('Native date input was not rendered');
            }
            expect(input.step).toBe('0.001');
            expect(input.value).toContain('12:34:56.123');
            await userEvent.fill(
                input,
                nativeFormat === format ? '2024-06-16T12:34:56.007' : '12:34:56.007',
            );
            expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(7);
            expect(onUpdate.mock.lastCall?.[0].hour()).toBe(12);
            expect(onUpdate.mock.lastCall?.[0].format(format)).toBe(
                nativeFormat === format ? '2024-06-16 12:34:56.007' : '2024-06-15 12:34:56.007',
            );
            for (const [nativeTime, milliseconds] of [
                ['12:34:56.01', 10],
                ['12:34:56.1', 100],
                ['12:34:56', 0],
            ] as const) {
                await userEvent.fill(
                    input,
                    `${nativeFormat === format ? '2024-06-16T' : ''}${nativeTime}`,
                );
                expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(milliseconds);
            }
            await userEvent.fill(input, nativeFormat === format ? '2024-06-16T12:35' : '12:35');
            expect(onUpdate.mock.lastCall?.[0].millisecond()).toBe(0);
            expect(onUpdate.mock.lastCall?.[0].minute()).toBe(35);
        },
    );

    it('includes milliseconds in the picker time format and retains them on date selection', async () => {
        const {result, act} = await renderHook(() =>
            useDatePickerState({defaultValue: value, format}),
        );
        expect(result.current.timeFormat).toBe('HH:mm:ss.SSS');
        act(() => result.current.setDateValue(value.add(1, 'day').startOf('day')));
        expect(result.current.value?.format(format)).toBe('2024-06-16 12:34:56.123');
    });
});
