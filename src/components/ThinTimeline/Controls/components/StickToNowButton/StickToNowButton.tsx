import {Button} from '@gravity-ui/uikit';

import {i18n} from '../../../i18n';

interface StickToNowButtonProps {
    className?: string;
    enableStickToNow: () => void;
}

export function StickToNowButton({className, enableStickToNow}: StickToNowButtonProps) {
    return (
        <Button size="s" view="flat" onClick={enableStickToNow} className={className}>
            {i18n('label.now')}
        </Button>
    );
}
