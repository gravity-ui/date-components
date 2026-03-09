import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {afterEach, describe, expect, it, vitest} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RelativeDateField} from '../RelativeDateField';

function TestRelativeDateField() {
    const [open, setOpen] = React.useState(true);

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <Dialog.Body>
                <div>Dialog content</div>
                <RelativeDateField />
            </Dialog.Body>
        </Dialog>
    );
}

describe('RelativeDateField', () => {
    afterEach(() => {
        vitest.useRealTimers();
    });

    it('calls onUpdate for each valid intermediate value when entering a relative expression', async () => {
        const onUpdate = vitest.fn();
        const screen = await render(<RelativeDateField onUpdate={onUpdate} />);

        await userEvent.tab();
        await userEvent.keyboard('now - 1d/w');

        const input = screen.getByRole('textbox').element() as HTMLInputElement;

        expect(input).toHaveValue('now - 1d/w');
        expect(onUpdate.mock.calls).toEqual([['now'], ['now '], ['now - 1d'], ['now - 1d/w']]);
    });

    it('clears invalid draft text when controlled value becomes null', async () => {
        function Test() {
            const [value, setValue] = React.useState<string | null>('now - 1d');

            return (
                <React.Fragment>
                    <RelativeDateField name="date-field" value={value} onUpdate={setValue} />
                    <button type="button" onClick={() => setValue(null)}>
                        reset
                    </button>
                </React.Fragment>
            );
        }

        const screen = await render(<Test />);

        await userEvent.tab();
        await userEvent.keyboard('{End}{Backspace}x');

        const input = screen.getByRole('textbox').element() as HTMLInputElement;
        const hiddenInput = document.querySelector('[name="date-field"]') as HTMLInputElement;

        expect(input).toHaveValue('now - 1x');
        expect(hiddenInput).toHaveValue('now - 1d');

        await userEvent.click(screen.getByRole('button', {name: 'reset'}));

        expect(input).toHaveValue('');
        expect(hiddenInput).toHaveValue('');
    });

    it('keeps invalid draft text without resetting committed value', async () => {
        const onUpdate = vitest.fn();
        const screen = await render(
            <RelativeDateField name="date-field" defaultValue="now - 1d" onUpdate={onUpdate} />,
        );

        await userEvent.tab();
        await userEvent.keyboard('{End}{Backspace}x');

        const input = screen.getByRole('textbox').element() as HTMLInputElement;
        const hiddenInput = document.querySelector('[name="date-field"]') as HTMLInputElement;

        expect(input).toHaveValue('now - 1x');
        expect(hiddenInput).toHaveValue('now - 1d');
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('preserves the selected calendar date for invalid input and updates it again when input becomes valid', async () => {
        vitest.setSystemTime(new Date('2024-05-15T12:00:00Z'));

        const screen = await render(<RelativeDateField defaultValue="now - 1d" />);

        await userEvent.tab();

        const input = screen.getByRole('textbox').element() as HTMLInputElement;

        expect(screen.getByRole('gridcell', {selected: true})).toHaveTextContent('14');

        await userEvent.keyboard('{End}{Backspace}x');

        expect(input).toHaveValue('now - 1x');
        expect(screen.getByRole('gridcell', {selected: true})).toHaveTextContent('14');

        await userEvent.keyboard('{Backspace}w');

        expect(input).toHaveValue('now - 1w');
        expect(screen.getByRole('gridcell', {selected: true})).toHaveTextContent('8');
    });

    it('restores the last correct value on blur after invalid input', async () => {
        const onUpdate = vitest.fn();
        const screen = await render(
            <RelativeDateField name="date-field" defaultValue="now - 1d" onUpdate={onUpdate} />,
        );

        await userEvent.tab();
        await userEvent.keyboard('{End}{Backspace}x');

        const input = screen.getByRole('textbox').element() as HTMLInputElement;
        const hiddenInput = document.querySelector('[name="date-field"]') as HTMLInputElement;

        expect(input).toHaveValue('now - 1x');
        expect(hiddenInput).toHaveValue('now - 1d');
        expect(onUpdate).not.toHaveBeenCalled();

        await userEvent.click(screen.container);

        expect(input).toHaveValue('now - 1d');
        expect(hiddenInput).toHaveValue('now - 1d');
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('closes popup on Escape from an element inside the group inside Dialog', async () => {
        const screen = await render(<TestRelativeDateField />);

        const input = screen.getByRole('textbox').element();

        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');

        expect(screen.getByRole('grid')).toBeInTheDocument();

        input.focus();
        await userEvent.keyboard('{Escape}');

        await expect.poll(() => screen.getByRole('grid')).not.toBeInTheDocument();
        await expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });
});
