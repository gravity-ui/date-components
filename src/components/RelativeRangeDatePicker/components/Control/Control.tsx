import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {getButtonSizeForInput} from '../../../utils/getButtonSizeForInput';
import type {RelativeRangeDatePickerState} from '../../hooks/useRelativeRangeDatePickerState';
import type {
    RelativeRangeDatePickerProps,
    RelativeRangeDatePickerRenderControlProps,
} from '../../types';
import {getDefaultTitle} from '../../utils';

import {i18n} from './i18n';

export type ControlProps = {
    props: RelativeRangeDatePickerProps;
    state: RelativeRangeDatePickerState;
} & Omit<
    RelativeRangeDatePickerRenderControlProps,
    'value' | 'title' | 'validationState' | 'errorMessage'
>;

const b = block('relative-range-date-picker-control');

export function Control({
    props,
    state,
    open,
    isMobile,
    ref,
    onClick,
    onKeyDown,
    onFocus,
    onClickCalendar,
    onUpdate,
}: ControlProps) {
    const {alwaysShowAsAbsolute, presetTabs, getRangeTitle} = props;
    const format = props.format || 'L';

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
                  }),
        [alwaysShowAsAbsolute, format, getRangeTitle, presetTabs, state.timeZone, state.value],
    );

    const validationState = props.validationState || (state.isInvalid ? 'invalid' : undefined);
    const errorMessage = props.errorMessage ?? state.errors.join('\n');

    return props.renderControl ? (
        props.renderControl({
            open: false,
            onClick,
            onKeyDown,
            onFocus,
            onClickCalendar,
            onUpdate,
            ref,
            value: state.value,
            title: text,
            validationState,
            errorMessage,
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
                    role: 'combobox',
                    'aria-expanded': open,
                    disabled: isMobile,
                    readOnly: props.readOnly,
                    className: b('input', {mobile: isMobile}),
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
                        extraProps={{
                            'aria-haspopup': 'dialog',
                            'aria-expanded': open,
                            'aria-label': i18n('Range date picker'),
                        }}
                        onClick={onClickCalendar}
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
}
