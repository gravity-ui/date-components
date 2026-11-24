import {block} from '../../utils/cn';

import './PickerPopupContent.scss';

const b = block('picker-popup-content');

interface PickerPopupContentProps {
    /** Calendar or the result of `children(calendarProps)` */
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
    timePanel?: React.ReactNode;
    /** Class name of the time panel wrapper */
    timePanelClassName?: string;
}

export function PickerPopupContent({
    children,
    className,
    footer,
    timePanel,
    timePanelClassName,
}: PickerPopupContentProps) {
    return (
        <div className={b(null, className)}>
            {children}
            {timePanel ? (
                <div className={b('time-panel', timePanelClassName)}>{timePanel}</div>
            ) : null}
            {footer ? <div className={b('footer')}>{footer}</div> : null}
        </div>
    );
}
