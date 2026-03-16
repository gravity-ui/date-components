import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RelativeDatePicker} from '../RelativeDatePicker';

function TestRelativeDatePicker() {
    const [open, setOpen] = React.useState(true);

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
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
});
