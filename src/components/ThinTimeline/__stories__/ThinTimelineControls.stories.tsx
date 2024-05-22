import type {Meta, StoryObj} from '@storybook/react';

import {ThinTimelineControls} from '..';
import {ThinTimelineControlsDemo} from '../../../demo/Components/ThinTimeline/ThinTimelineControlsDemo';
import {WithRulerTemplateDemo} from '../../../demo/Components/ThinTimeline/WithRulerTemplateDemo';

type Story = StoryObj<typeof ThinTimelineControls>;

const meta: Meta<typeof ThinTimelineControls> = {
    title: 'Components/ThinTimeline/ThinTimelineControls',
    component: ThinTimelineControls,
    tags: ['autodocs'],
    argTypes: {
        timeZone: {
            control: 'select',
            options: ['Empty', 'UTC', 'Europe/Moscow'],
        },
    },
};

export default meta;

export const Default = {
    render: (args) => {
        return <ThinTimelineControlsDemo {...args} />;
    },
} satisfies Story;

export const WithRulerTemplate = {
    ...Default,
    render: (args) => {
        return <WithRulerTemplateDemo {...args} />;
    },
} satisfies Story;
