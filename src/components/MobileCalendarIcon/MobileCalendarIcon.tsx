import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {TextInputSize} from '@gravity-ui/uikit/build/esm/components/controls/TextInput/TextInput';

import {block} from '../../utils/cn';
import {getButtonSizeForInput} from '../utils/getButtonSizeForInput';

import './MobileCalendarIcon.scss';

const b = block('mobile-calendar-icon');

export interface MobileCalendarIconProps {
    size?: TextInputSize;
}

export const MobileCalendarIcon = (props: MobileCalendarIconProps) => {
    return (
        <span className={b({size: getButtonSizeForInput(props.size)})}>
            <span className={b('button')}>
                <Icon data={CalendarIcon} />
            </span>
        </span>
    );
};
