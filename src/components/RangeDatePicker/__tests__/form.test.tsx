import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vitest} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import type {RangeValue} from '../../types';
import {RangeDatePicker} from '../RangeDatePicker';

describe('RangeDatePicker: form', () => {
    it('should submit empty value by default', async () => {
        let value;
        const onSubmit = vitest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        const screen = await render(
            <form onSubmit={onSubmit}>
                <RangeDatePicker name="date-field" />
                <button type="submit">submit</button>
            </form>,
        );
        await userEvent.click(screen.getByRole('button', {name: 'submit'}));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([
            ['date-field', ''],
            ['date-field', ''],
        ]);
    });

    it('should submit default value', async () => {
        let value;
        const onSubmit = vitest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });

        const range = {
            start: dateTime({input: '2020-01-01T00:00:00Z'}),
            end: dateTime({input: '2020-01-02T00:00:00Z'}),
        };
        const screen = await render(
            <form onSubmit={onSubmit}>
                <RangeDatePicker name="date-field" defaultValue={range} />
                <button type="submit">submit</button>
            </form>,
        );
        await userEvent.click(screen.getByRole('button', {name: 'submit'}));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([
            ['date-field', '2020-01-01T00:00:00.000Z'],
            ['date-field', '2020-01-02T00:00:00.000Z'],
        ]);
    });

    it('should submit controlled value', async () => {
        let value;
        const onSubmit = vitest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        const range = {
            start: dateTime({input: '2020-01-01T00:00:00Z'}),
            end: dateTime({input: '2020-01-02T00:00:00Z'}),
        };
        const screen = await render(
            <form onSubmit={onSubmit}>
                <RangeDatePicker name="date-field" value={range} />
                <button type="submit">submit</button>
            </form>,
        );
        await userEvent.click(screen.getByRole('button', {name: 'submit'}));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([
            ['date-field', '2020-01-01T00:00:00.000Z'],
            ['date-field', '2020-01-02T00:00:00.000Z'],
        ]);
    });

    it('supports form reset', async () => {
        function Test() {
            const [value, setValue] = React.useState<RangeValue<DateTime> | null>({
                start: dateTime({input: '2020-01-01T00:00:00Z'}),
                end: dateTime({input: '2021-01-01T00:00:00Z'}),
            });
            return (
                <form>
                    <RangeDatePicker name="date-field" value={value} onUpdate={setValue} />
                    <input type="reset" data-qa="reset" />
                </form>
            );
        }

        const screen = await render(<Test />);
        const inputs = document.querySelectorAll('[name=date-field]');
        expect(inputs.length).toBe(2);
        expect(inputs[0]).toHaveValue('2020-01-01T00:00:00.000Z');
        expect(inputs[1]).toHaveValue('2021-01-01T00:00:00.000Z');

        await userEvent.tab();
        await userEvent.keyboard('{ArrowUp}');

        expect(inputs[0]).toHaveValue('2020-02-01T00:00:00.000Z');
        expect(inputs[1]).toHaveValue('2021-01-01T00:00:00.000Z');

        const button = screen.getByTestId('reset');
        await userEvent.click(button);
        expect(inputs[0]).toHaveValue('2020-01-01T00:00:00.000Z');
        expect(inputs[1]).toHaveValue('2021-01-01T00:00:00.000Z');
    });
});
