import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RelativeRangeDatePicker} from '../RelativeRangeDatePicker';

function TestRelativeRangeDatePicker() {
    const [open, setOpen] = React.useState(true);

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <Dialog.Body>
                <div>Dialog content</div>
                <RelativeRangeDatePicker label="Range" />
            </Dialog.Body>
        </Dialog>
    );
}

describe('RelativeRangeDatePicker', () => {
    it('closes its popup on Escape from the group inside Dialog', async () => {
        const screen = await render(<TestRelativeRangeDatePicker />);

        const combobox = screen.getByLabelText('Range', {exact: true});
        const calendarButton = screen.getByLabelText('Range date picker');

        expect(combobox).toBeInTheDocument();
        expect(calendarButton).toBeInTheDocument();

        combobox.element().focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(combobox).toHaveAttribute('aria-expanded', 'true');
        combobox.element().focus();
        await userEvent.keyboard('{Escape}');

        expect(combobox).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });
});
