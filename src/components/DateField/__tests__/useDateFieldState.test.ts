import {dateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';

import {renderHook} from '#test-utils/utils';

import {useDateFieldState} from '../hooks/useDateFieldState';
import {cleanString} from '../utils';

describe('invalid date entry', () => {
    it('allows entering day 31 even if placeholder month has 30 days', async () => {
        const {result, act} = await renderHook(() =>
            useDateFieldState({
                format: 'DD.MM.YYYY',
                placeholderValue: dateTime({input: '2024-06-15', format: 'YYYY-MM-DD'}),
            }),
        );

        const dayIndex = result.current.sections.findIndex((section) => section.type === 'day');

        act(() => {
            result.current.setSelectedSections(dayIndex);
            result.current.onInput('3');
            result.current.onInput('1');
        });

        const daySection = result.current.sections[dayIndex];
        expect(daySection.value).toBe(31);
        expect(cleanString(daySection.textValue)).toBe('31');
    });

    it('suppresses updates, and constrains on blur', async () => {
        const onUpdate = vi.fn();
        const {result, act} = await renderHook(() =>
            useDateFieldState({
                format: 'DD.MM.YYYY',
                onUpdate,
            }),
        );

        const dayIndex = result.current.sections.findIndex((section) => section.type === 'day');
        const monthIndex = result.current.sections.findIndex((section) => section.type === 'month');
        const yearIndex = result.current.sections.findIndex((section) => section.type === 'year');

        act(() => {
            result.current.setSelectedSections(dayIndex);
        });
        act(() => {
            result.current.onInput('3');
        });
        act(() => {
            result.current.onInput('1');
        });
        act(() => {
            result.current.setSelectedSections(monthIndex);
        });
        act(() => {
            result.current.onInput('0');
        });
        act(() => {
            result.current.onInput('4');
        });
        act(() => {
            result.current.setSelectedSections(yearIndex);
        });
        act(() => {
            result.current.onInput('2');
        });
        act(() => {
            result.current.onInput('0');
        });
        act(() => {
            result.current.onInput('2');
        });
        act(() => {
            result.current.onInput('4');
        });

        expect(result.current.value).toBeNull();
        expect(onUpdate).not.toHaveBeenCalled();

        act(() => {
            result.current.confirmPlaceholder();
        });

        expect(result.current.validationState).toBeUndefined();
        expect(result.current.value?.format('DD.MM.YYYY')).toBe('30.04.2024');
        expect(onUpdate).toHaveBeenCalled();
    });
});
