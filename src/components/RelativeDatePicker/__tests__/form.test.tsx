/* eslint-disable testing-library/no-node-access */
import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import userEvent from '@testing-library/user-event';

import {render, screen} from '../../../../test-utils/utils';
import {RelativeDatePicker} from '../RelativeDatePicker';
import type {Value} from '../hooks/useRelativeDatePickerState';

describe('RelativeDatePicker: form', () => {
    it('should submit empty value by default', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeDatePicker name="date-field" />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([
            ['date-field', ''],
            ['date-field', ''],
        ]);
    });

    it('should submit default value', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });

        const date = {type: 'absolute', value: dateTime({input: '2020-01-01T00:00:00Z'})} as const;
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeDatePicker name="date-field" defaultValue={date} />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([
            ['date-field', 'absolute'],
            ['date-field', '2020-01-01T00:00:00.000Z'],
        ]);
    });

    it('should submit controlled value', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        const date = {type: 'absolute', value: dateTime({input: '2020-01-01T00:00:00Z'})} as const;
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeDatePicker name="date-field" value={date} />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([
            ['date-field', 'absolute'],
            ['date-field', '2020-01-01T00:00:00.000Z'],
        ]);
    });

    it('supports form reset', async () => {
        function Test() {
            const [value, setValue] = React.useState<Value | null>({
                value: dateTime({input: '2020-01-01T00:00:00Z'}),
                type: 'absolute',
            });
            return (
                <form>
                    <RelativeDatePicker
                        name="date-field"
                        value={value}
                        onUpdate={setValue}
                        autoFocus
                    />
                    <input type="reset" data-qa="reset" />
                </form>
            );
        }

        render(<Test />);
        const inputs = document.querySelectorAll('[name=date-field]');
        expect(inputs.length).toBe(2);
        expect(inputs[0]).toHaveValue('absolute');
        expect(inputs[1]).toHaveValue('2020-01-01T00:00:00.000Z');

        await userEvent.keyboard('{ArrowUp}');

        expect(inputs[0]).toHaveValue('absolute');
        expect(inputs[1]).toHaveValue('2020-02-01T00:00:00.000Z');

        const button = screen.getByTestId('reset');
        await userEvent.click(button);
        expect(inputs[0]).toHaveValue('absolute');
        expect(inputs[1]).toHaveValue('2020-01-01T00:00:00.000Z');
    });
});
