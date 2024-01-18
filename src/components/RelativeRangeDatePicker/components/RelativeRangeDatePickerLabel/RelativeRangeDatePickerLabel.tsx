import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import type {TextInputSize} from '@gravity-ui/uikit';

import {pick} from '../../../../utils/pick';
import type {FocusEvents, TextInputProps, Validation} from '../../../types';
import {getButtonSizeForInput} from '../../../utils/getButtonSizeForInput';
import type {RelativeRangeDatepickerSingleValue, RelativeRangeDatepickerValue} from '../../types';

import {i18n} from './i18n';

interface Props
    extends Omit<FocusEvents, 'autoFocus'>,
        Omit<TextInputProps, 'placeholder'>,
        Validation {
    isOpen: boolean;
    onOpenChange(): void;
    inputRef: React.RefObject<HTMLInputElement>;
    calendarButtonRef: React.RefObject<HTMLButtonElement>;
    onClear(): void;

    value?: RelativeRangeDatepickerValue | null;
    hasClear?: boolean;
    size?: TextInputSize;
    disabled?: boolean;
    format?: string;
}

function getDateLabel(value?: RelativeRangeDatepickerSingleValue, format?: string) {
    if (!value) return '';
    if (value.type === 'relative') return value.value;
    return value.value.format(format || 'L');
}

export function RelativeRangeDatePickerLabel(props: Props) {
    const {value, format} = props;

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
                    'aria-expanded': props.isOpen,
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
            validationState={props.errorMessage ? 'invalid' : undefined}
            errorPlacement={props.errorPlacement || 'inside'}
            errorMessage={props.errorMessage}
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
