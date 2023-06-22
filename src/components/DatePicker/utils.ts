import type {TextInputSize} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';

export const b = block('date-picker');

export function getButtonSize(size: TextInputSize | undefined) {
    switch (size) {
        case 'xl': {
            return 'l';
        }
        case 'l': {
            return 'm';
        }
        case 's': {
            return 'xs';
        }
        default: {
            return 's';
        }
    }
}
