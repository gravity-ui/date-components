import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Dialog} from '@gravity-ui/uikit';
import {describe, expect, it, vitest} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {cleanString} from '../../DateField/utils';
import {DatePicker} from '../DatePicker';
import type {DatePickerProps} from '../DatePicker';

const DATE_TIME_FORMAT = 'DD.MM.YYYY HH:mm';
const value = dateTime({input: '2024-01-15T10:30:00Z', timeZone: 'UTC'});

async function renderOpenDatePicker(props: DatePickerProps) {
    const screen = await render(
        <React.Fragment>
            <DatePicker format={DATE_TIME_FORMAT} timeZone="UTC" {...props} />
            <button type="button">outside</button>
        </React.Fragment>,
    );
    if (!props.defaultOpen) {
        await userEvent.click(screen.getByRole('button', {name: 'Calendar'}));
    }
    await expect.element(screen.getByRole('grid')).toBeInTheDocument();

    return screen;
}

// The popup is modal: while it is open, everything outside of it is hidden from the accessibility tree
function getInput() {
    return document.querySelector('input[role="combobox"]') as HTMLInputElement;
}

function getDay(screen: Awaited<ReturnType<typeof render>>, day: number) {
    return screen.getByRole('button', {name: new RegExp(`, January ${day}, 2024$`)});
}

function TestDatePicker() {
    const [open, setOpen] = React.useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Body>
                <div>Dialog content</div>
                <DatePicker disableFocusTrap />
            </Dialog.Body>
        </Dialog>
    );
}

describe('DatePicker', () => {
    it('closes its popup on Escape from the group inside Dialog when focus trap is disabled', async () => {
        const screen = await render(<TestDatePicker />);
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

    it('keeps the time of the current value when a day is selected', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({defaultValue: value, onUpdate});

        await userEvent.click(getDay(screen, 17));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate.mock.calls[0][0].toISOString()).toBe('2024-01-17T10:30:00.000Z');
        expect(cleanString(getInput().value)).toBe('17.01.2024 10:30');
    });

    it('uses the time of the placeholder when a day is selected without a value', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({onUpdate, placeholderValue: value});

        await userEvent.click(getDay(screen, 17));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate.mock.calls[0][0].toISOString()).toBe('2024-01-17T10:30:00.000Z');
    });

    it('stays open after a day is selected when the format has time', async () => {
        const screen = await renderOpenDatePicker({defaultValue: value});

        await userEvent.click(getDay(screen, 17));

        expect(cleanString(getInput().value)).toBe('17.01.2024 10:30');
        expect(getInput()).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes after a day is selected when the format has no time', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({
            defaultValue: value,
            format: 'DD.MM.YYYY',
            onUpdate,
        });

        await userEvent.click(getDay(screen, 17));

        await expect.poll(() => screen.getByRole('grid')).not.toBeInTheDocument();
        expect(getInput()).toHaveAttribute('aria-expanded', 'false');
        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(cleanString(getInput().value)).toBe('17.01.2024');
    });

    it('closes on Escape and keeps the selected value', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({defaultValue: value, onUpdate});

        await userEvent.click(getDay(screen, 17));
        await userEvent.keyboard('{Escape}');

        await expect.poll(() => screen.getByRole('grid')).not.toBeInTheDocument();
        expect(getInput()).toHaveAttribute('aria-expanded', 'false');
        expect(cleanString(getInput().value)).toBe('17.01.2024 10:30');
        expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('closes on click outside and keeps the selected value', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({defaultValue: value, onUpdate});

        await userEvent.click(getDay(screen, 17));
        await userEvent.click(screen.getByText('outside'), {force: true});

        await expect.poll(() => screen.getByRole('grid')).not.toBeInTheDocument();
        expect(getInput()).toHaveAttribute('aria-expanded', 'false');
        expect(cleanString(getInput().value)).toBe('17.01.2024 10:30');
        expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('does not select days outside of minValue and maxValue', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({
            defaultValue: value,
            maxValue: dateTime({input: '2024-01-20T23:59:59Z', timeZone: 'UTC'}),
            minValue: dateTime({input: '2024-01-10T00:00:00Z', timeZone: 'UTC'}),
            onUpdate,
        });

        await expect.element(getDay(screen, 9)).toHaveAttribute('aria-disabled', 'true');
        await expect.element(getDay(screen, 21)).toHaveAttribute('aria-disabled', 'true');
        await userEvent.click(getDay(screen, 9), {force: true});
        await userEvent.click(getDay(screen, 21), {force: true});

        expect(onUpdate).not.toHaveBeenCalled();

        await userEvent.click(getDay(screen, 10));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate.mock.calls[0][0].toISOString()).toBe('2024-01-10T10:30:00.000Z');
    });

    it('selects a day in the timeZone and returns the value in the time zone of the current value', async () => {
        const onUpdate = vitest.fn();
        // 05:30 on January 16 in Tokyo
        const utcValue = dateTime({input: '2024-01-15T20:30:00Z', timeZone: 'UTC'});
        const screen = await renderOpenDatePicker({
            defaultValue: utcValue,
            onUpdate,
            timeZone: 'Asia/Tokyo',
        });

        expect(cleanString(getInput().value)).toBe('16.01.2024 05:30');
        await userEvent.click(getDay(screen, 18));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate.mock.calls[0][0].toISOString()).toBe('2024-01-17T20:30:00.000Z');
        expect(onUpdate.mock.calls[0][0].timeZone()).toBe('UTC');
    });

    it('does not call onUpdate when readOnly', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({defaultValue: value, onUpdate, readOnly: true});

        await userEvent.click(getDay(screen, 17));

        expect(onUpdate).not.toHaveBeenCalled();
        expect(cleanString(getInput().value)).toBe('15.01.2024 10:30');
    });

    it('does not call onUpdate when disabled', async () => {
        const onUpdate = vitest.fn();
        const screen = await renderOpenDatePicker({
            defaultOpen: true,
            defaultValue: value,
            disabled: true,
            onUpdate,
        });

        expect(getInput()).toBeDisabled();
        await userEvent.click(getDay(screen, 17), {force: true});

        expect(onUpdate).not.toHaveBeenCalled();
        expect(cleanString(getInput().value)).toBe('15.01.2024 10:30');
    });

    it('renders custom children with calendarProps in place of the calendar', async () => {
        const onUpdate = vitest.fn();
        const children = vitest.fn<NonNullable<DatePickerProps['children']>>((calendarProps) => (
            <button
                type="button"
                onClick={() =>
                    calendarProps.onUpdate?.(
                        dateTime({input: '2024-01-17T00:00:00Z', timeZone: 'UTC'}),
                    )
                }
            >
                custom calendar
            </button>
        ));
        const screen = await render(
            <DatePicker
                defaultValue={value}
                format={DATE_TIME_FORMAT}
                onUpdate={onUpdate}
                timeZone="UTC"
            >
                {children}
            </DatePicker>,
        );

        await userEvent.click(screen.getByRole('button', {name: 'Calendar'}));
        await expect
            .element(screen.getByRole('button', {name: 'custom calendar'}))
            .toBeInTheDocument();

        expect(screen.getByRole('grid')).not.toBeInTheDocument();
        const calendarProps = children.mock.lastCall?.[0];
        expect(calendarProps?.value?.toISOString()).toBe('2024-01-15T10:30:00.000Z');
        expect(calendarProps?.timeZone).toBe('UTC');

        await userEvent.click(screen.getByRole('button', {name: 'custom calendar'}));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate.mock.calls[0][0].toISOString()).toBe('2024-01-17T10:30:00.000Z');
    });
});
