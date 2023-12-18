import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import type {TextInputSize} from '@gravity-ui/uikit';

import {pick} from '../../../utils/pick';
import {i18n} from '../../RelativeDatePicker/i18n';
import type {FocusableProps, TextInputProps} from '../../types';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import type {RangeDatepickerSingleValue, RangeDatepickerValue} from '../types';

interface Props extends Omit<FocusableProps, 'autoFocus'>, Omit<TextInputProps, 'placeholder'> {
    isOpen: boolean;
    onOpenChange(): void;
    inputRef: React.RefObject<HTMLInputElement>;
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

export function RangeDatePickerLabel(props: Props) {
    const {isOpen, value, format} = props;

    function getLabel() {
        const startLabel = getDateLabel(value?.start, format);
        const endLabel = getDateLabel(value?.end, format);
        if (!startLabel && !endLabel) return '';
        return `${startLabel} — ${endLabel}`;
    }

    function renderIcon() {
        return (
            <Button
                {...pick(props, 'onFocus', 'onBlur', 'disabled')}
                ref={props.calendarButtonRef}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                size={getButtonSizeForInput(props.size)}
                extraProps={{
                    'aria-label': i18n('Calendar'),
                    'aria-haspopup': 'dialog',
                    'aria-expanded': isOpen,
                }}
                view="flat-secondary"
                onClick={props.onOpenChange}
            >
                <Icon data={CalendarIcon} />
            </Button>
        );
    }

    return (
        <TextInput
            {...pick(props, 'hasClear', 'label', 'pin', 'view', 'size')}
            controlRef={props.inputRef}
            value={getLabel()}
            autoComplete="off"
            rightContent={renderIcon()}
            onUpdate={(value) => {
                if (!value) {
                    props.onClear();
                }
            }}
        />
    );
}
