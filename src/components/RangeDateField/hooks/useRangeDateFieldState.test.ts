import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {act, renderHook} from '@testing-library/react';

import {cleanString, isEditableSection} from '../../DateField/utils';
import type {RangeValue} from '../../types';

import {useRangeDateFieldState} from './useRangeDateFieldState';

test('can display the correct range', () => {
    const timeZone = 'Israel';
    const {result} = renderHook(() =>
        useRangeDateFieldState({
            format: 'DD.MM.YYYY',
            placeholderValue: dateTime({input: '2024-01-12T00:00:00', timeZone}),
            timeZone,
            value: {
                start: dateTime({input: '2024-01-20T12:30:00', timeZone}),
                end: dateTime({input: '2024-01-24T12:00:00', timeZone}),
            },
        }),
    );

    const {text} = result.current;
    expect(cleanString(text)).toBe('20.01.2024 — 24.01.2024');
});

test('can navigate through the range and change sections', () => {
    const timeZone = 'Israel';
    const {result} = renderHook(() =>
        useRangeDateFieldState({
            format: 'DD.MM.YYYY',
            placeholderValue: dateTime({input: '2024-01-12T00:00:00', timeZone}),
            timeZone,
        }),
    );

    expect(cleanString(result.current.text)).toBe('DD.MM.YYYY — DD.MM.YYYY');

    act(() => result.current.focusFirstSection());
    act(() => result.current.increment());
    act(() => result.current.focusNextSection());
    act(() => result.current.incrementPage());
    act(() => result.current.incrementPage());

    const position = result.current.sections.filter((e) => isEditableSection(e))[4]?.end;

    act(() => result.current.focusSectionInPosition(position));
    act(() => result.current.increment());

    expect(cleanString(result.current.text)).toBe('12.03.YYYY — DD.01.YYYY');
});

test('call onUpdate only if the entire value is valid', () => {
    const onUpdateSpy = jest.fn();
    const timeZone = 'Israel';
    const {result} = renderHook(() =>
        useRangeDateFieldState({
            format: 'DD.MM.YYYY',
            placeholderValue: dateTime({input: '2024-01-12T00:00:00', timeZone}),
            timeZone,
            onUpdate: onUpdateSpy,
        }),
    );

    act(() => result.current.focusFirstSection());
    act(() => result.current.incrementToMax());
    act(() => result.current.focusNextSection());
    act(() => result.current.increment());
    act(() => result.current.focusNextSection());
    act(() => result.current.increment());
    act(() => result.current.focusNextSection());
    act(() => result.current.increment());
    act(() => result.current.focusNextSection());
    act(() => result.current.increment());
    act(() => result.current.increment());
    act(() => result.current.focusPreviousSection());
    act(() => result.current.incrementToMax());

    expect(onUpdateSpy).not.toHaveBeenCalled();

    act(() => result.current.focusLastSection());
    act(() => result.current.increment());

    expect(cleanString(result.current.text)).toBe('31.01.2024 — 29.02.2024');

    expect(onUpdateSpy).toHaveBeenLastCalledWith({
        start: dateTime({input: '2024-01-31T00:00:00', timeZone}),
        end: dateTime({input: '2024-02-29T00:00:00', timeZone}),
    });
});

test('can set a range from the string', () => {
    const {result} = renderHook(() =>
        useRangeDateFieldState({
            format: 'DD.MM.YYYY',
            placeholderValue: dateTime({input: '2024-01-12T00:00:00'}),
        }),
    );

    act(() => result.current.setValueFromString('31.01.2024 — 29.02.2024'));

    expect(cleanString(result.current.text)).toBe('31.01.2024 — 29.02.2024');
});

test('can clear the section or the entire range', () => {
    let value: RangeValue<DateTime> | null = {
        start: dateTime({input: '2024-01-20T12:30:00'}),
        end: dateTime({input: '2024-01-24T12:00:00'}),
    };

    const onUpdate = (newValue: RangeValue<DateTime> | null) => {
        value = newValue;
    };

    const {result} = renderHook(() =>
        useRangeDateFieldState({
            format: 'DD.MM.YYYY',
            placeholderValue: dateTime({input: '2024-01-12T00:00:00'}),
            value,
            onUpdate,
        }),
    );

    expect(cleanString(result.current.text)).toBe('20.01.2024 — 24.01.2024');

    const position = result.current.sections.filter((e) => isEditableSection(e))[4]?.end;

    act(() => result.current.focusSectionInPosition(position));
    act(() => result.current.clearSection());

    expect(cleanString(result.current.text)).toBe('20.01.2024 — 24.MM.2024');

    act(() => result.current.clearAll());

    expect(cleanString(result.current.text)).toBe('DD.MM.YYYY — DD.MM.YYYY');
});
