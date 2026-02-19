import {dateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {DateField} from '../DateField';
import {cleanString} from '../utils';

describe('DateField', () => {
    describe('format rendering', () => {
        it('renders two-digit year correctly for YY format', async () => {
            const value = dateTime({input: '2024-01-15T00:00:00'});
            const screen = await render(<DateField value={value} format="YY" />);

            const input = screen.getByRole('textbox').element() as HTMLInputElement;
            expect(cleanString(input.value)).toBe(value.format('YY'));
        });

        it('renders ordinal day token correctly for Do format', async () => {
            const value = dateTime({input: '2024-04-01T00:00:00'});
            const screen = await render(<DateField value={value} format="Do MMMM YYYY" />);

            const input = screen.getByRole('textbox').element() as HTMLInputElement;
            expect(cleanString(input.value)).toBe(value.format('Do MMMM YYYY'));
        });

        it('renders ordinal quarter token correctly for Qo format', async () => {
            const value = dateTime({input: '2024-05-01T00:00:00'});
            const screen = await render(<DateField value={value} format="Qo YYYY" />);

            const input = screen.getByRole('textbox').element() as HTMLInputElement;
            expect(cleanString(input.value)).toBe(value.format('Qo YYYY'));
        });

        it('keeps entered textual month during intermediate invalid state', async () => {
            const timeZone = 'Europe/Amsterdam';
            const screen = await render(
                <DateField
                    format="DD MMMM YYYY"
                    placeholderValue={dateTime({input: '2024-01-15', timeZone})}
                />,
            );

            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('31042024');

            const input = screen.getByRole('textbox').element() as HTMLInputElement;
            expect(cleanString(input.value)).toBe('31 April 2024');
        });
    });

    describe('invalid date', () => {
        it('should allow to enter 31 april and constrains the date on blur', async () => {
            const onUpdate = vi.fn();
            const timeZone = 'Europe/Amsterdam';
            const screen = await render(
                <DateField
                    format="DD.MM.YYYY"
                    placeholderValue={dateTime({input: '2024-04-15', timeZone})}
                    onUpdate={onUpdate}
                />,
            );
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('31042024');

            const input = screen.getByRole('textbox').element() as HTMLInputElement;

            expect(onUpdate).not.toHaveBeenCalled();
            expect(cleanString(input.value)).toBe('31.04.2024');

            await userEvent.keyboard('{Tab}');

            expect(onUpdate).toHaveBeenCalledWith(dateTime({input: '2024-04-30', timeZone}));
            expect(cleanString(input.value)).toBe('30.04.2024');
        });

        it('should allow to enter 2am during a forward DST transition', async () => {
            const onUpdate = vi.fn();
            const timeZone = 'Europe/Amsterdam';
            const screen = await render(
                <DateField
                    format="DD.MM.YYYY HH:mm"
                    placeholderValue={dateTime({input: '2024-03-31T00:00', timeZone})}
                    onUpdate={onUpdate}
                />,
            );
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('310320240200');

            const input = screen.getByRole('textbox').element() as HTMLInputElement;

            expect(onUpdate).not.toHaveBeenCalled();
            expect(cleanString(input.value)).toBe('31.03.2024 02:00');

            await userEvent.keyboard('{Tab}');

            expect(onUpdate).toHaveBeenCalledWith(dateTime({input: '2024-03-31T01:00Z', timeZone}));
            expect(cleanString(input.value)).toBe('31.03.2024 03:00');
        });
    });
});
