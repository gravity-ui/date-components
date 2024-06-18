/* eslint-disable testing-library/no-node-access */
import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import userEvent from '@testing-library/user-event';

import {render, screen, within} from '../../../../test-utils/utils';
import type {Value} from '../../RelativeDatePicker';
import type {RangeValue} from '../../types';
import {RelativeRangeDatePicker} from '../RelativeRangeDatePicker';

describe('RelativeRangeDatePicker: form', () => {
    it('should submit empty value by default', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeRangeDatePicker name="date-field" />
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
            ['date-field', ''],
            ['date-field', ''],
            ['date-field', 'default'],
        ]);
    });

    it('should submit default value', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });

        const date = {
            start: {type: 'absolute', value: dateTime({input: '2020-01-01T00:00:00Z'})},
            end: null,
        } as const;
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeRangeDatePicker name="date-field" defaultValue={date} />
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
            ['date-field', ''],
            ['date-field', ''],
            ['date-field', 'default'],
        ]);
    });

    it('should submit controlled value', async () => {
        let value;
        const onSubmit = jest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.entries()];
        });
        const date = {
            start: {type: 'absolute', value: dateTime({input: '2020-01-01T00:00:00Z'})},
            end: null,
        } as const;
        render(
            <form data-qa="form" onSubmit={onSubmit}>
                <RelativeRangeDatePicker name="date-field" value={date} />
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
            ['date-field', ''],
            ['date-field', ''],
            ['date-field', 'default'],
        ]);
    });

    it('supports form reset', async () => {
        function Test() {
            const [value, setValue] = React.useState<RangeValue<Value | null> | null>({
                start: {
                    value: dateTime({input: '2020-01-01T00:00:00Z'}),
                    type: 'absolute',
                },
                end: {
                    value: 'now',
                    type: 'relative',
                },
            });
            return (
                <form>
                    <RelativeRangeDatePicker name="date-field" value={value} onUpdate={setValue} />
                    <input type="reset" data-qa="reset" />
                </form>
            );
        }

        render(<Test />);
        const inputs = document.querySelectorAll('[name=date-field]');
        expect(inputs.length).toBe(5);
        expect(inputs[0]).toHaveValue('absolute');
        expect(inputs[1]).toHaveValue('2020-01-01T00:00:00.000Z');
        expect(inputs[2]).toHaveValue('relative');
        expect(inputs[3]).toHaveValue('now');

        await userEvent.tab();
        const fields = within(document.activeElement as HTMLElement).getAllByRole('textbox');
        expect(fields.length).toBe(2);
        fields[0].focus();
        await userEvent.keyboard('{ArrowUp}');

        expect(inputs[0]).toHaveValue('absolute');
        expect(inputs[1]).toHaveValue('2020-02-01T00:00:00.000Z');
        expect(inputs[2]).toHaveValue('relative');
        expect(inputs[3]).toHaveValue('now');

        const button = screen.getByTestId('reset');
        await userEvent.click(button);
        expect(inputs[0]).toHaveValue('absolute');
        expect(inputs[1]).toHaveValue('2020-01-01T00:00:00.000Z');
        expect(inputs[2]).toHaveValue('relative');
        expect(inputs[3]).toHaveValue('now');
    });
});
