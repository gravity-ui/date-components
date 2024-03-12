import {Icon} from '@gravity-ui/uikit';
import type {ButtonSize, IconData} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';

import './StubButton.scss';

const b = block('stub-button');

interface StubButtonProps {
    size?: ButtonSize;
    icon: IconData;
}
export function StubButton({size, icon}: StubButtonProps) {
    return (
        <span className={b({size})}>
            <span className={b('icon')}>
                <Icon data={icon} />
            </span>
        </span>
    );
}
