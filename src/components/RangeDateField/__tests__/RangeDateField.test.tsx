import {dateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {cleanString} from '../../DateField/utils.js';
import {isMac} from '../../utils/constants.js';
import {RangeDateField} from '../RangeDateField';

describe('RangeDateField', () => {
    function getSelectAllShortcut() {
        return isMac ? '{Meta>}a{/Meta}' : '{Control>}a{/Control}';
    }

    it('should display the correct range', async () => {
        const timeZone = 'Israel';
        const screen = await render(
            <RangeDateField
                format="DD.MM.YYYY"
                placeholderValue={dateTime({input: '2024-01-12T00:00:00', timeZone})}
                timeZone={timeZone}
                value={{
                    start: dateTime({input: '2024-01-20T12:30:00', timeZone}),
                    end: dateTime({input: '2024-01-24T12:00:00', timeZone}),
                }}
            />,
        );

        const input = screen.getByRole('textbox').first().element() as HTMLInputElement;
        expect(cleanString(input.value)).toBe('20.01.2024 — 24.01.2024');
    });

    it('should navigate through the range and change sections', async () => {
        const timeZone = 'Israel';
        const screen = await render(
            <RangeDateField
                format="DD.MM.YYYY"
                placeholderValue={dateTime({input: '2024-01-12T00:00:00', timeZone})}
                timeZone={timeZone}
            />,
        );
        const input = screen.getByRole('textbox').first().element() as HTMLInputElement;

        expect(cleanString(input.value)).toBe('DD.MM.YYYY — DD.MM.YYYY');

        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{ArrowUp}{ArrowRight}{PageUp}{PageUp}');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowUp}');

        expect(cleanString(input.value)).toBe('12.03.YYYY — DD.01.YYYY');
    });

    it('should call onUpdate only if the entire value is valid', async () => {
        const onUpdateSpy = vi.fn();
        const timeZone = 'Israel';
        const screen = await render(
            <RangeDateField
                format="DD.MM.YYYY"
                placeholderValue={dateTime({input: '2024-01-12T00:00:00', timeZone})}
                timeZone={timeZone}
                onUpdate={onUpdateSpy}
            />,
        );
        const input = screen.getByRole('textbox').first().element() as HTMLInputElement;

        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('3104202431042024');

        expect(onUpdateSpy).not.toHaveBeenCalled();
        expect(cleanString(input.value)).toBe('31.04.2024 — 31.04.2024');

        await userEvent.keyboard('{Tab}');

        expect(onUpdateSpy).toHaveBeenCalledWith({
            start: dateTime({input: '2024-04-30T00:00:00', timeZone}).startOf('day'),
            end: dateTime({input: '2024-04-30T00:00:00', timeZone}).endOf('day'),
        });
    });

    it('should set a range from the string', async () => {
        const screen = await render(
            <div>
                <RangeDateField
                    aria-label="target"
                    format="DD.MM.YYYY"
                    placeholderValue={dateTime({input: '2024-01-12T00:00:00'})}
                />
                <input type="text" defaultValue="31.01.2024 — 29.02.2024" aria-label="source" />
            </div>,
        );
        const input = screen.getByLabelText('target').element() as HTMLInputElement;
        const source = screen.getByLabelText('source').element() as HTMLInputElement;

        await userEvent.click(source);
        await userEvent.keyboard(getSelectAllShortcut());
        await userEvent.copy();
        await userEvent.click(input);
        await userEvent.paste();

        expect(cleanString(input.value)).toBe('31.01.2024 — 29.02.2024');
    });

    it('should clear the section or the entire range', async () => {
        const screen = await render(
            <RangeDateField
                format="DD.MM.YYYY"
                defaultValue={{
                    start: dateTime({input: '2024-01-20T12:30:00'}),
                    end: dateTime({input: '2024-01-24T12:00:00'}),
                }}
                placeholderValue={dateTime({input: '2024-01-12T00:00:00'})}
            />,
        );
        const input = screen.getByRole('textbox').element() as HTMLInputElement;

        expect(cleanString(input.value)).toBe('20.01.2024 — 24.01.2024');

        await userEvent.keyboard('{Tab}');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
        await userEvent.keyboard('{Backspace}');

        expect(cleanString(input.value)).toBe('20.01.2024 — 24.MM.2024');

        await userEvent.keyboard(getSelectAllShortcut());
        await userEvent.keyboard('{Backspace}');

        expect(cleanString(input.value)).toBe('DD.MM.YYYY — DD.MM.YYYY');
    });

    describe('invalid date', () => {
        it('should allow to enter 31 april - 31 april and constrains the range on blur', async () => {
            const onUpdate = vi.fn();
            const timeZone = 'Europe/Amsterdam';
            await render(
                <RangeDateField
                    format="DD.MM.YYYY"
                    placeholderValue={dateTime({input: '2024-04-15', timeZone})}
                    onUpdate={onUpdate}
                />,
            );
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('3104202431042024');

            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.keyboard('{Tab}');

            const expectedStart = dateTime({input: '2024-04-30', timeZone});
            expect(onUpdate).toHaveBeenCalledWith({
                start: expectedStart.startOf('day'),
                end: expectedStart.endOf('day'),
            });
        });
    });
});
