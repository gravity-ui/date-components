import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, TextInput, useMobile} from '@gravity-ui/uikit';
import type {TextInputSize} from '@gravity-ui/uikit';

import {pick} from '../../../utils/pick';
import {MobileCalendarIcon} from '../../MobileCalendarIcon';
import {i18n} from '../../RelativeDatePicker/i18n';
import type {FocusableProps, TextInputProps} from '../../types';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import type {RangeDatepickerSingleValue, RangeDatepickerValue} from '../types';

interface Props extends Omit<FocusableProps, 'autoFocus'>, Omit<TextInputProps, 'placeholder'> {
    isOpen: boolean;
    onOpenChange(): void;
    calendarButtonRef: React.RefObject<HTMLButtonElement>;
    onClear(): void;

    value?: RangeDatepickerValue | null;
    hasClear?: boolean;
    size?: TextInputSize;
    disabled?: boolean;
    format?: string;
}

function getDateLabel(value?: RangeDatepickerSingleValue, format?: string) {
    if (!value) return '';
    if (value.type === 'relative') return value.value;
    return value.value.format(format || 'L');
}

export const RangeDatePickerLabel = (props: Props) => {
    const {isOpen, calendarButtonRef, value, format} = props;

    const [isMobile] = useMobile();

    const handleFocus = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement, HTMLElement>) => {
            e.preventDefault();
            e.currentTarget.blur();
            setTimeout(() => {
                calendarButtonRef?.current?.focus();
            });
        },
        [calendarButtonRef],
    );

    const extraProps = React.useMemo((): React.ButtonHTMLAttributes<HTMLButtonElement> => {
        return {
            'aria-label': i18n('Calendar'),
            'aria-haspopup': 'dialog',
            'aria-expanded': isOpen,
        };
    }, [isOpen]);

    const label = React.useMemo(() => {
        const startLabel = getDateLabel(value?.start, format);
        const endLabel = getDateLabel(value?.end, format);
        if (!startLabel && !endLabel) return '';
        return `${startLabel} — ${endLabel}`;
    }, [value, format]);

    function renderIcon() {
        return (
            <Button
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                ref={props.calendarButtonRef}
                size={getButtonSizeForInput(props.size)}
                disabled={props.disabled}
                extraProps={extraProps}
                view="flat-secondary"
                onClick={props.onOpenChange}
            >
                {isMobile ? <MobileCalendarIcon size={props.size} /> : <Icon data={CalendarIcon} />}
            </Button>
        );
    }

    return (
        <TextInput
            {...pick(props, 'hasClear', 'label', 'pin', 'view', 'size')}
            value={label}
            tabIndex={-1}
            onFocus={handleFocus}
            autoComplete="off"
            rightContent={renderIcon()}
            onUpdate={props.onClear}
        />
    );
};
