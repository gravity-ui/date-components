/* eslint-disable testing-library/no-node-access */
import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import userEvent from '@testing-library/user-event';

import {render, screen} from '../../../../test-utils/utils';
import {DatePicker} from '../DatePicker';

describe('DatePicker: form', () => {
    it('should submit empty value by default', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <DatePicker name="date-field" />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([['date-field', '']]);
    });

    it('should submit default value', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });

        const date = dateTime({input: '2020-01-01T00:00:00Z'});
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <DatePicker name="date-field" defaultValue={date} />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([['date-field', '2020-01-01T00:00:00.000Z']]);
    });

    it('should submit controlled value', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        const date = dateTime({input: '2020-01-01T00:00:00Z'});
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <DatePicker name="date-field" value={date} />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([['date-field', '2020-01-01T00:00:00.000Z']]);
    });

    it('supports form reset', async () => {
        function Test() {
            const [value, setValue] = React.useState<DateTime | null>(
                dateTime({input: '2020-01-01T00:00:00Z'}),
            );
            return (
                <form>
                    <DatePicker name="date-field" value={value} onUpdate={setValue} />
                    <input type="reset" data-qa="reset" />
                </form>
            );
        }

        render(<Test />);
        const inputs = document.querySelectorAll('[name=date-field]');
        expect(inputs.length).toBe(1);
        expect(inputs[0]).toHaveValue('2020-01-01T00:00:00.000Z');

        await userEvent.tab();
        await userEvent.keyboard('{ArrowUp}');

        expect(inputs[0]).toHaveValue('2020-02-01T00:00:00.000Z');

        const button = screen.getByTestId('reset');
        await userEvent.click(button);
        expect(inputs[0]).toHaveValue('2020-01-01T00:00:00.000Z');
    });
});
