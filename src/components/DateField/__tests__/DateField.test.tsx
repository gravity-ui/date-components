import {dateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {DateField} from '../DateField';
import {cleanString} from '../utils';

describe('DateField', () => {
    it('should display the correct placeholder for empty and focused states', async () => {
        const screen = await render(<DateField placeholder="Select date" format="DD.MM.YYYY" />);
        const input = screen.getByRole('textbox').element() as HTMLInputElement;

        expect(input.placeholder).toBe('Select date');
        expect(input.value).toBe('');

        await userEvent.keyboard('{Tab}');

        expect(cleanString(input.value)).toBe('DD.MM.YYYY');

        await userEvent.click(screen.container);
        expect(input.value).toBe('');
    });

    it('should display the correct placeholder for changed states', async () => {
        const screen = await render(
            <DateField
                placeholder="Select date"
                format="DD.MM.YYYY"
                placeholderValue={dateTime({input: '2024-12-31'})}
            />,
        );
        const input = screen.getByRole('textbox').element() as HTMLInputElement;

        expect(input.placeholder).toBe('Select date');
        expect(input.value).toBe('');

        await userEvent.keyboard('{Tab}');

        expect(cleanString(input.value)).toBe('DD.MM.YYYY');

        await userEvent.keyboard('{ArrowUp}');

        expect(cleanString(input.value)).toBe('31.MM.YYYY');

        await userEvent.click(screen.container);

        expect(cleanString(input.value)).toBe('31.MM.YYYY');
    });

    it('should focus previous section when backspacing on an empty date section', async () => {
        const value = dateTime({input: '2024-12-31'});
        const screen = await render(<DateField defaultValue={value} format="DD.MM.YYYY" />);
        const input = screen.getByRole('textbox').element() as HTMLInputElement;

        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');

        expect(cleanString(input.value)).toBe('31.12.2024');

        // Press backspace to delete '2024'
        for (let i = 0; i < 4; i++) {
            await userEvent.keyboard('{backspace}');
        }
        expect(cleanString(input.value)).toBe('31.12.YYYY');
        expect(input.selectionStart).toBe(15);
        expect(input.selectionEnd).toBe(21);

        await userEvent.keyboard('{backspace}');

        expect(cleanString(input.value)).toBe('31.12.YYYY');
        expect(input.selectionStart).toBe(8);
        expect(input.selectionEnd).toBe(12);

        // Press backspace to delete '12'
        for (let i = 0; i < 2; i++) {
            await userEvent.keyboard('{backspace}');
        }
        expect(cleanString(input.value)).toBe('31.MM.YYYY');
        expect(input.selectionStart).toBe(8);
        expect(input.selectionEnd).toBe(12);

        await userEvent.keyboard('{backspace}');
        expect(input.selectionStart).toBe(1);
        expect(input.selectionEnd).toBe(5);

        expect(cleanString(input.value)).toBe('31.MM.YYYY');
    });

    it('should allow continue entering value after backspacing', async () => {
        const value = dateTime({input: '2024-12-31'});
        const screen = await render(<DateField defaultValue={value} format="DD.MM.YYYY" />);
        const input = screen.getByRole('textbox').element() as HTMLInputElement;

        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');

        expect(cleanString(input.value)).toBe('31.12.2024');

        await userEvent.keyboard('{backspace}');
        expect(cleanString(input.value)).toBe('31.12.0202');

        await userEvent.keyboard('{backspace}');
        expect(cleanString(input.value)).toBe('31.12.0020');

        await userEvent.keyboard('25');
        expect(cleanString(input.value)).toBe('31.12.2025');
    });

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
