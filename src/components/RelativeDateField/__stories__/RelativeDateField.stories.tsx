import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {action} from 'storybook/actions';

import {timeZoneControl} from '../../../demo/utils/zones';
import {RelativeDateField} from '../RelativeDateField';

const meta: Meta<typeof RelativeDateField> = {
    title: 'Components/RelativeDateField',
    component: RelativeDateField,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
};

export default meta;

type Story = StoryObj<typeof RelativeDateField>;

export const Default: Story = {
    render: (props) => {
        return <RelativeDateField {...props} />;
    },
    args: {
        onUpdate: (res) => {
            action('onUpdate')(res);
            toaster.add({
                name: 'on-change-cb',
                title: 'onUpdate callback',
                theme: 'success',
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
        timeZone: timeZoneControl,
    },
};
