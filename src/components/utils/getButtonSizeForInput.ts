import type {TextInputSize} from '@gravity-ui/uikit';

export function getButtonSizeForInput(size: TextInputSize | undefined) {
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
