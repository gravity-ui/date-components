import type {DateTime} from '@gravity-ui/date-utils';
import type {Meta, StoryObj} from '@storybook/react';

import {ThinTimelineRuler} from '..';
import CustomSelectionDemo from '../../../demo/Components/ThinTimeline/CustomSelectionDemo';
import CustomTicksDemo from '../../../demo/Components/ThinTimeline/CustomTicksDemo';
import SelectionWithCustomTooltipDemo from '../../../demo/Components/ThinTimeline/SelectionWithCustomTooltipDemo';
import SelectionWithCustomTooltipInContainerDemo from '../../../demo/Components/ThinTimeline/SelectionWithCustomTooltipInContainerDemo';
import SelectionWithTooltipDemo from '../../../demo/Components/ThinTimeline/SelectionWithTooltipDemo';
import {ThinTimelineRulerDemo} from '../../../demo/Components/ThinTimeline/ThinTimelineRulerDemo';

const meta: Meta<typeof ThinTimelineRuler> = {
    title: 'Components/ThinTimeline/ThinTimelineRuler',
    component: ThinTimelineRuler,
    argTypes: {
        timeZone: {
            control: 'select',
            options: ['Empty', 'UTC', 'Europe/Moscow', 'Europe/Amsterdam'],
        },
    },
} as Meta;

export default meta;
type Story = StoryObj<typeof ThinTimelineRuler>;

export const Default = {
    render: (args) => {
        return <ThinTimelineRulerDemo {...args} />;
    },
} satisfies Story;

export const CustomTicks = {
    render: () => {
        return <CustomTicksDemo />;
    },
} satisfies Story;
export const CustomSelection = {
    render: () => {
        return <CustomSelectionDemo />;
    },
} satisfies Story;
export const SelectionWithTooltip = {
    render: () => {
        return <SelectionWithTooltipDemo />;
    },
} satisfies Story;
export const SelectionWithCustomTooltip = {
    render: () => {
        return <SelectionWithCustomTooltipDemo />;
    },
} satisfies Story;
export const SelectionWithCustomTooltipInContainer = {
    render: () => {
        return <SelectionWithCustomTooltipInContainerDemo />;
    },
} satisfies Story;

export const CustomTimeRender = {
    ...Default,
    args: {
        formatTime: (time: DateTime) => {
            return time.format('HH:mm:ss');
        },
    },
} satisfies Story;

export const DisabledTimelineDragging = {
    ...Default,
    args: {
        isTimelineDragEnabled: false,
    },
} satisfies Story;
