import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RangeDatePicker} from '../RangeDatePicker';

function TestRangeDatePicker() {
    const [open, setOpen] = React.useState(true);

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
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

        const combobox = screen.getByRole('combobox');
        const calendarButton = screen.getByRole('button', {name: 'Calendar'});
        combobox.element().focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await expect(combobox).toHaveAttribute('aria-expanded', 'true');

        calendarButton.element().focus();
        await userEvent.keyboard('{Escape}');

        await expect(combobox).toHaveAttribute('aria-expanded', 'false');
        await expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });
});
