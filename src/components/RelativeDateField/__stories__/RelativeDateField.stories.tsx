import {toaster} from '@gravity-ui/uikit/toaster-singleton-react-18';
import type {Meta, StoryObj} from '@storybook/react';

import {RelativeDateField} from '../RelativeDateField.js';

const meta: Meta<typeof RelativeDateField> = {
    title: 'Components/RelativeDateField',
    component: RelativeDateField,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RelativeDateField>;

export const Default: Story = {
    render: (props) => {
        return <RelativeDateField {...props} />;
    },
    args: {
        onUpdate: (res) => {
            toaster.add({
                name: 'on-change-cb',
                title: 'onUpdate callback',
                type: 'success',
                content: (
                    <div>
                        <div>value: {res ?? 'null'}</div>
                    </div>
                ),
            });
        },
    },
    argTypes: {
        validationState: {
            options: ['invalid', 'none'],
            mapping: {
                none: undefined,
            },
        },
    },
};
