/* eslint-disable testing-library/no-node-access */
import React from 'react';

import userEvent from '@testing-library/user-event';

import {render, screen} from '../../../../test-utils/utils';
import {RelativeDateField} from '../RelativeDateField';

describe('RelativeDateField: form', () => {
    it('should submit empty value by default', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeDateField name="date-field" />
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

        const date = 'now - 1d';
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeDateField name="date-field" defaultValue={date} />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([['date-field', date]]);
    });

    it('should submit controlled value', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        const date = 'now - 1d';
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeDateField name="date-field" value={date} />
                <button type="submit" data-qa="submit">
                    submit
                </button>
            </form>,
        );
        await userEvent.click(screen.getByTestId('submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual([['date-field', date]]);
    });

    it('supports form reset', async () => {
        function Test() {
            const [value, setValue] = React.useState<string | null>('now - 1d');
            return (
                <form>
                    <RelativeDateField name="date-field" value={value} onUpdate={setValue} />
                    <input type="reset" data-qa="reset" />
                </form>
            );
        }

        render(<Test />);
        const inputs = document.querySelectorAll('[name=date-field]');
        expect(inputs.length).toBe(1);
        expect(inputs[0]).toHaveValue('now - 1d');

        await userEvent.tab();
        await userEvent.keyboard('{End}{Backspace}{w}');
        expect(inputs[0]).toHaveValue('now - 1w');

        const button = screen.getByTestId('reset');
        await userEvent.click(button);
        expect(inputs[0]).toHaveValue('now - 1d');
    });
});
