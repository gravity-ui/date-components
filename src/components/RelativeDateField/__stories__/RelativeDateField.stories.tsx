import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {action} from 'storybook/actions';

import preview from '#.storybook/preview';

import {timeZoneControl} from '../../../demo/utils/zones';
import {RelativeDateField} from '../RelativeDateField';

const meta = preview.meta({
    title: 'Components/RelativeDateField',
    component: RelativeDateField,
    tags: ['autodocs'],
    args: {
        onFocus: action('onFocus'),
        onBlur: action('onBlur'),
    },
});

export const Default = meta.story({
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
});
