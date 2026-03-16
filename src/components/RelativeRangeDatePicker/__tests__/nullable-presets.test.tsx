import React from 'react';

import {describe, expect, it, vitest} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RelativeRangeDatePicker} from '../RelativeRangeDatePicker';
import type {Preset} from '../components/Presets/defaultPresets';
import type {PresetTab} from '../components/Presets/utils';

const presetTabs: PresetTab[] = [
    {
        id: 'main',
        title: 'Presets',
        presets: [
            {from: 'now-5d', to: 'now', title: 'Last five days'},
            {from: 'not-a-date', to: 'now', title: 'Broken preset'},
        ],
    },
    {
        id: 'unlimited',
        title: 'Unlimited',
        presets: [
            {from: null, to: 'now', title: 'Past'},
            {from: 'now', to: null, title: 'Future'},
        ],
    },
];

const docsWithNullableRows: Preset[] = [
    {title: 'Past', from: null, to: 'now'},
    {title: 'Future', from: 'now', to: null},
    {title: 'Last 5 minutes', from: 'now - 5m', to: 'now'},
];

async function openPicker(screen: Awaited<ReturnType<typeof render>>) {
    await userEvent.click(screen.getByLabelText('picker', {exact: true}));
}

async function openUnlimitedTab(screen: Awaited<ReturnType<typeof render>>) {
    await userEvent.click(screen.getByRole('tab', {name: 'Unlimited'}));
}

function ToggleNullablePicker() {
    const [allowNullableValues, setAllowNullableValues] = React.useState(true);

    return (
        <React.Fragment>
            <button
                type="button"
                onClick={() => {
                    setAllowNullableValues((value) => !value);
                }}
            >
                toggle-nullable
            </button>
            <RelativeRangeDatePicker
                withPresets
                presetTabs={presetTabs}
                allowNullableValues={allowNullableValues}
                label="picker"
            />
        </React.Fragment>
    );
}

describe('RelativeRangeDatePicker: nullable presets', () => {
    it('filters nullable and malformed presets when nullable values are disabled', async () => {
        const screen = await render(
            <RelativeRangeDatePicker
                withPresets
                presetTabs={presetTabs}
                allowNullableValues={false}
                label="picker"
            />,
        );

        await openPicker(screen);

        expect(screen.getByText('Last five days')).toBeInTheDocument();
        expect(screen.getByText('Broken preset')).not.toBeInTheDocument();
        expect(screen.getByRole('tab', {name: 'Unlimited'})).not.toBeInTheDocument();
    });

    it('shows nullable presets and still hides malformed presets when nullable values are enabled', async () => {
        const screen = await render(
            <RelativeRangeDatePicker
                withPresets
                presetTabs={presetTabs}
                allowNullableValues
                label="picker"
            />,
        );

        await openPicker(screen);

        expect(screen.getByRole('tab', {name: 'Unlimited'})).toBeInTheDocument();
        expect(screen.getByText('Broken preset')).not.toBeInTheDocument();

        await openUnlimitedTab(screen);

        expect(screen.getByText('Past')).toBeInTheDocument();
        expect(screen.getByText('Future')).toBeInTheDocument();
    });

    it('submits nullable preset values through hidden form inputs', async () => {
        let value: FormDataEntryValue[] = [];
        const onSubmit = vitest.fn((e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            value = [...formData.values()];
        });

        const screen = await render(
            <form onSubmit={onSubmit}>
                <RelativeRangeDatePicker
                    name="date-field"
                    withPresets
                    presetTabs={presetTabs}
                    allowNullableValues
                    label="picker"
                />
                <button type="submit">submit</button>
            </form>,
        );

        await openPicker(screen);
        await openUnlimitedTab(screen);
        await userEvent.click(screen.getByText('Future'));

        await expect.element(screen.getByLabelText('picker', {exact: true})).toHaveValue('Future');

        await userEvent.click(screen.getByRole('button', {name: 'submit'}));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(value).toEqual(['relative', 'now', '', '', 'default']);
    });

    it('recomputes the control title when nullable mode toggles', async () => {
        const screen = await render(<ToggleNullablePicker />);

        await openPicker(screen);
        await openUnlimitedTab(screen);
        await userEvent.click(screen.getByText('Future'));

        await expect.element(screen.getByLabelText('picker', {exact: true})).toHaveValue('Future');

        await userEvent.click(screen.getByRole('button', {name: 'toggle-nullable'}));

        await expect.element(screen.getByLabelText('picker', {exact: true})).toHaveValue('now — ');

        await openPicker(screen);

        expect(screen.getByRole('tab', {name: 'Unlimited'})).not.toBeInTheDocument();
        expect(screen.getByText('Future')).not.toBeInTheDocument();
        expect(screen.getByText('Last five days')).toBeInTheDocument();
    });

    it('hides nullable docs rows when nullable values are disabled', async () => {
        const screen = await render(
            <RelativeRangeDatePicker
                withHeader
                allowNullableValues={false}
                docs={docsWithNullableRows}
                label="picker"
            />,
        );

        await userEvent.tab();
        await userEvent.tab();
        await userEvent.keyboard('{Enter}');

        expect(screen.getByText('Last 5 minutes')).toBeInTheDocument();
        expect(screen.getByText('Past')).not.toBeInTheDocument();
        expect(screen.getByText('Future')).not.toBeInTheDocument();
    });
});
