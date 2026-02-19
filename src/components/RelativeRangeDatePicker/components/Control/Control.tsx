import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, TextInput, useLang} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {getButtonSizeForInput} from '../../../utils/getButtonSizeForInput';
import type {RelativeRangeDatePickerState} from '../../hooks/useRelativeRangeDatePickerState';
import type {RelativeRangeDatePickerProps, RelativeRangeDatePickerTriggerProps} from '../../types';
import {getDefaultTitle} from '../../utils';
import {i18n as i18nPresets} from '../Presets/i18n';

import {i18n} from './i18n';

import './Control.scss';

type ControlProps = {
    props: RelativeRangeDatePickerProps;
    state: RelativeRangeDatePickerState;
    open: boolean;
    setOpen: (open: boolean) => void;
    isMobile?: boolean;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
    onClickCalendar: (e: React.MouseEvent<HTMLElement>) => void;
    onUpdate: (value: string) => void;
};

const b = block('relative-range-date-picker-control');

export const Control = React.forwardRef<HTMLInputElement, ControlProps>(
    (
        {
            props,
            state,
            open,
            setOpen,
            isMobile,
            onClick,
            onKeyDown,
            onFocus,
            onClickCalendar,
            onUpdate,
        },
        ref,
    ) => {
        const {alwaysShowAsAbsolute, presetTabs, getRangeTitle} = props;
        const format = props.format || 'L';

        const {t} = i18n.useTranslation();
        const {t: presetsTranslations} = i18nPresets.useTranslation();
        const {lang} = useLang();

        const text = React.useMemo(
            () =>
                typeof getRangeTitle === 'function'
                    ? getRangeTitle(state.value, state.timeZone)
                    : getDefaultTitle({
                          value: state.value,
                          timeZone: state.timeZone,
                          alwaysShowAsAbsolute,
                          format,
                          presets: presetTabs?.flatMap(({presets}) => presets),
                          presetsTranslations,
                          lang,
                      }),
            [
                alwaysShowAsAbsolute,
                format,
                getRangeTitle,
                lang,
                presetTabs,
                presetsTranslations,
                state.timeZone,
                state.value,
            ],
        );

        const validationState = props.validationState || (state.isInvalid ? 'invalid' : undefined);
        const errorMessage = props.errorMessage ?? state.errors.join('\n');

        const triggerProps: RelativeRangeDatePickerTriggerProps = {
            id: props.id,
            role: 'combobox',
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            'aria-label': props['aria-label'],
            'aria-labelledby': props['aria-labelledby'],
            'aria-describedby': props['aria-describedby'],
            'aria-details': props['aria-details'],
            disabled: props.disabled,
            readOnly: props.readOnly,
            onClick: onClickCalendar,
            onKeyDown,
        };

        return props.renderControl ? (
            props.renderControl({
                ref,
                value: state.value,
                title: text,
                validationState,
                errorMessage,
                open,
                setOpen,
                triggerProps,
            })
        ) : (
            <React.Fragment>
                <TextInput
                    id={props.id}
                    autoFocus={props.autoFocus}
                    controlRef={ref}
                    value={text}
                    placeholder={props.placeholder}
                    onUpdate={onUpdate}
                    controlProps={{
                        className: b('input', {mobile: isMobile}),
                        ...triggerProps,
                        disabled: isMobile,
                        onClick,
                    }}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    validationState={validationState}
                    errorMessage={errorMessage}
                    errorPlacement={props.errorPlacement}
                    pin={props.pin}
                    size={props.size}
                    label={props.label}
                    hasClear={props.hasClear}
                    disabled={props.disabled}
                    endContent={
                        <Button
                            view="flat-secondary"
                            size={getButtonSizeForInput(props.size)}
                            disabled={props.disabled}
                            aria-haspopup="dialog"
                            aria-expanded={open}
                            aria-label={t('Range date picker')}
                            onClick={onClickCalendar}
                            tabIndex={-1}
                        >
                            <Icon data={CalendarIcon} />
                        </Button>
                    }
                />
                {isMobile ? (
                    <button
                        className={b('mobile-trigger', {
                            'has-clear': Boolean(props.hasClear && state.value),
                            'has-errors': state.isInvalid && props.errorPlacement === 'inside',
                            size: props.size,
                        })}
                        onClick={onClick}
                    />
                ) : null}
            </React.Fragment>
        );
    },
);

Control.displayName = 'Control';
