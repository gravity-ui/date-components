import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Dialog} from '@gravity-ui/uikit';
import {describe, expect, it, vitest} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RelativeDatePicker} from '../RelativeDatePicker';
import type {RelativeDatePickerProps} from '../RelativeDatePicker';

async function renderFocusedRelativeDatePicker(props: RelativeDatePickerProps = {}) {
    const screen = await render(
        <React.Fragment>
            <RelativeDatePicker
                defaultValue={{
                    type: 'absolute',
                    value: dateTime({input: '2024-01-15T10:30:00Z', timeZone: 'UTC'}),
                }}
                format="DD.MM.YYYY HH:mm"
                timeZone="UTC"
                {...props}
            />
            <button type="button">outside</button>
        </React.Fragment>,
    );
    screen.getByRole('combobox').element().focus();
    await expect.element(screen.getByRole('grid')).toBeInTheDocument();

    return screen;
}

function TestRelativeDatePicker() {
    const [open, setOpen] = React.useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Body>
                <div>Dialog content</div>
                <RelativeDatePicker />
            </Dialog.Body>
        </Dialog>
    );
}

describe('RelativeDatePicker', () => {
    it('closes its popup on Escape from the group inside Dialog', async () => {
        const screen = await render(<TestRelativeDatePicker />);
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

    it('opens on input focus and keeps the time of the current value when a day is selected', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderFocusedRelativeDatePicker({onUpdate});

        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');

        await userEvent.click(screen.getByRole('button', {name: 'Wednesday, January 17, 2024'}));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        const value = onUpdate.mock.calls[0][0];
        expect(value.type).toBe('absolute');
        expect(value.value.toISOString()).toBe('2024-01-17T10:30:00.000Z');
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
        const screen = await renderFocusedRelativeDatePicker();

        await userEvent.keyboard('{Escape}');

        await expect.poll(() => screen.getByRole('grid')).not.toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes when focus leaves the picker', async () => {
        const screen = await renderFocusedRelativeDatePicker();

        screen.getByRole('button', {name: 'outside'}).element().focus();

        await expect.poll(() => screen.getByRole('grid')).not.toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
});
