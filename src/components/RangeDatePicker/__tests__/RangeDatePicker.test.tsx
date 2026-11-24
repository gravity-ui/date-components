import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Dialog} from '@gravity-ui/uikit';
import {describe, expect, it, vitest} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RangeDatePicker} from '../RangeDatePicker';

function TestRangeDatePicker() {
    const [open, setOpen] = React.useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Body>
                <div>Dialog content</div>
                <RangeDatePicker disableFocusTrap />
            </Dialog.Body>
        </Dialog>
    );
}

describe('RangeDatePicker', () => {
    it('closes its popup on Escape from the group inside Dialog when focus trap is disabled', async () => {
        const screen = await render(<TestRangeDatePicker />);
        // Dialog moves focus to its content once the opening transition ends
        await expect.element(screen.getByRole('dialog')).toHaveFocus();

        const combobox = screen.getByRole('combobox');
        const calendarButton = screen.getByRole('button', {name: 'Calendar'});
        combobox.element().focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(combobox).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('grid')).toBeInTheDocument();

        calendarButton.element().focus();
        await userEvent.keyboard('{Escape}');

        await expect.poll(() => screen.getByRole('grid')).not.toBeInTheDocument();
        expect(combobox).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('selects a range with two clicks, keeps the times of the current value and stays open', async () => {
        const onUpdate = vitest.fn();
        const screen = await render(
            <RangeDatePicker
                defaultValue={{
                    start: dateTime({input: '2024-01-15T10:30:00Z', timeZone: 'UTC'}),
                    end: dateTime({input: '2024-01-20T18:45:00Z', timeZone: 'UTC'}),
                }}
                format="DD.MM.YYYY HH:mm"
                onUpdate={onUpdate}
                timeZone="UTC"
            />,
        );
        // The popup is modal: while it is open, the input is hidden from the accessibility tree
        const input = screen.getByRole('combobox').element();
        await userEvent.click(screen.getByRole('button', {name: 'Calendar'}));

        await userEvent.click(screen.getByRole('button', {name: 'Wednesday, January 10, 2024'}));

        expect(onUpdate).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole('button', {name: 'Friday, January 12, 2024'}));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        const {start, end} = onUpdate.mock.calls[0][0];
        expect(start.toISOString()).toBe('2024-01-10T10:30:00.000Z');
        expect(end.toISOString()).toBe('2024-01-12T18:45:00.000Z');
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });
});
