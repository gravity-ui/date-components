import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import type {TextInputSize} from '@gravity-ui/uikit';

import {pick} from '../../../utils/pick';
import type {FocusableProps, TextInputProps, Validation} from '../../types';
import {getButtonSizeForInput} from '../../utils/getButtonSizeForInput';
import type {RelativeRangeDatepickerValue} from '../types';

import {i18n} from './i18n';
import {getDateLabel} from './utils';

interface Props extends FocusableProps, Omit<TextInputProps, 'placeholder'>, Validation {
    isOpen: boolean;
    onOpen(): void;
    inputRef: React.RefObject<HTMLInputElement>;
    onClear(): void;

    alwaysShowAsAbsolute?: boolean;
    value?: RelativeRangeDatepickerValue | null;
    hasClear?: boolean;
    size?: TextInputSize;
    disabled?: boolean;
    format?: string;
    style?: React.CSSProperties;
}

export function RelativeRangeDatePickerLabel(props: Props) {
    const {value, format, alwaysShowAsAbsolute} = props;

    function getLabel() {
        const startLabel = getDateLabel({value: value?.start, format, alwaysShowAsAbsolute});
        const endLabel = getDateLabel({value: value?.end, format, alwaysShowAsAbsolute});
        if (!startLabel && !endLabel) return '';
        return `${startLabel} — ${endLabel}`;
    }

    function renderIcon() {
        return (
            <Button
                {...pick(props, 'onFocus', 'onBlur', 'disabled')}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                size={getButtonSizeForInput(props.size)}
                extraProps={{
                    'aria-label': i18n('Calendar'),
                    'aria-haspopup': 'dialog',
                    'aria-expanded': props.isOpen,
                }}
                view="flat-secondary"
                onClick={props.onOpen}
            >
                <Icon data={CalendarIcon} />
            </Button>
        );
    }

    return (
        <TextInput
            {...pick(props, 'hasClear', 'label', 'pin', 'view', 'size', 'disabled', 'autoFocus')}
            style={props.style}
            validationState={props.errorMessage ? 'invalid' : props.validationState}
            errorPlacement={props.errorPlacement || 'inside'}
            errorMessage={props.errorMessage}
            controlRef={props.inputRef}
            value={getLabel()}
            autoComplete="off"
            rightContent={renderIcon()}
            controlProps={{
                onClick: props.onOpen,
            }}
            onUpdate={(newValue) => {
                if (!newValue) {
                    props.onClear();
                }
            }}
        />
    );
}
