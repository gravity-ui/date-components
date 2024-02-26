import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, Popover, TextInput, useFocusWithin, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import type {Value} from '../RelativeDatePicker';
import type {
    DomProps,
    InputBase,
    RangeValue,
    StyleProps,
    TextInputProps,
    Validation,
} from '../types';
import {getButtonSizeForInput} from '../utils/getButtonSizeForInput';

import {PickerDialog} from './components/PickerDialog/PickerDialog';
import type {PresetTab} from './components/Presets/utils';
import {useRelativeRangeDatePickerState} from './hooks/useRelativeRangeDatePickerState';
import type {RelativeRangeDatePickerStateOptions} from './hooks/useRelativeRangeDatePickerState';
import {i18n} from './i18n';
import {getDefaultTitle} from './utils';

import './RelativeRangeDatePicker.scss';

const b = block('relative-range-date-picker');

export interface RelativeRangeDatePickerProps
    extends RelativeRangeDatePickerStateOptions,
        DomProps,
        InputBase,
        TextInputProps,
        Validation,
        StyleProps {
    /** Format of the date when rendered in the input. [Available formats](https://day.js.org/docs/en/display/format) */
    format?: string;
    /** A placeholder date that controls the default values of each segment when the user first interacts with them. Defaults to today's date at midnight. */
    placeholderValue?: DateTime;
    /** Apply changes with button */
    withApplyButton?: boolean;
    /** Show time zone selector */
    withZonesList?: boolean;
    /** Show relative range presets */
    withPresets?: boolean;
    /** Custom preset tabs */
    presetTabs?: PresetTab[];
    /** Show selected relative values as absolute dates */
    alwaysShowAsAbsolute?: boolean;
    /** */
    getRangeTitle?: (value: RangeValue<Value | null> | null, timeZone: string) => string;
    /** Sets the CSS className for the popup element. */
    popupClassName?: string;
}

export function RelativeRangeDatePicker(props: RelativeRangeDatePickerProps) {
    const state = useRelativeRangeDatePickerState(props);

    const isMobile = useMobile();

    const anchorRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [isActive, setIsActive] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const {focusWithinProps} = useFocusWithin({
        isDisabled: props.disabled || isMobile,
        onFocusWithinChange: (isFocusedWithin) => {
            if (!isFocusedWithin) {
                setIsActive(false);
            }
        },
    });

    const {alwaysShowAsAbsolute, presetTabs, getRangeTitle} = props;
    const format = props.format ?? 'L';
    const text = React.useMemo(
        () =>
            typeof getRangeTitle === 'function'
                ? getRangeTitle(state.value, state.timeZone)
                : getDefaultTitle({
                      value: state.value,
                      timeZone: state.timeZone,
                      alwaysShowAsAbsolute: alwaysShowAsAbsolute,
                      format,
                      presets: presetTabs?.flatMap(({presets}) => presets),
                  }),
        [alwaysShowAsAbsolute, format, getRangeTitle, presetTabs, state.timeZone, state.value],
    );

    const validationState = props.validationState || (state.isInvalid ? 'invalid' : undefined);
    const errorMessage = props.errorMessage ?? state.errors.join('\n');

    return (
        <div
            ref={anchorRef}
            {...focusWithinProps}
            className={b(null, props.className)}
            style={props.style}
        >
            <Popover
                className={b('value-label')}
                tooltipContentClassName={b('value-label-tooltip')}
                disabled={isMobile || open || !state.value}
                delayOpening={500}
                placement={['right', 'right-start', 'right-end', 'auto']}
                hasArrow={false}
                content={
                    <ValueLabel value={state.value} format={format} timeZone={state.timeZone} />
                }
            >
                <TextInput
                    controlRef={inputRef}
                    value={text}
                    placeholder={props.placeholder}
                    onUpdate={(v) => {
                        if (!props.readOnly && !v) {
                            state.setValue(null, 'default');
                        }
                    }}
                    controlProps={{
                        'aria-haspopup': 'dialog',
                        'aria-expanded': open,
                        disabled: isMobile,
                        className: b('input', {mobile: isMobile}),
                    }}
                    onKeyDown={(e) => {
                        if (props.disabled) {
                            return;
                        }
                        if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                            e.preventDefault();
                            setOpen(true);
                        }
                    }}
                    onFocus={() => {
                        if (!isActive) {
                            setIsActive(true);
                            setOpen(true);
                        }
                    }}
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
                            }}
                            onClick={() => {
                                setIsActive(true);
                                setOpen(!open);
                            }}
                        >
                            <Icon data={CalendarIcon} />
                        </Button>
                    }
                />
            </Popover>
            {isMobile ? (
                <button
                    className={b('mobile-trigger', {
                        'has-clear': Boolean(props.hasClear && state.value),
                        'has-errors': state.isInvalid && props.errorPlacement === 'inside',
                        size: props.size,
                    })}
                    onClick={() => {
                        setIsActive(true);
                        setOpen(true);
                    }}
                />
            ) : null}
            <PickerDialog
                state={state}
                props={props}
                open={open}
                onClose={() => {
                    setOpen(false);
                }}
                anchorRef={anchorRef}
                isMobile={isMobile}
                className={props.className}
            />
        </div>
    );
}

interface ValueLabelProps {
    value: RangeValue<Value | null> | null;
    format: string;
    timeZone: string;
}
function ValueLabel({value, format, timeZone}: ValueLabelProps) {
    return (
        <div className={b('value-label-content')}>
            <span className={b('value-label-item')}>
                {dateTimeParse(value?.start?.value, {timeZone})?.format(format)}
            </span>
            <span className={b('value-label-to')}>{i18n('to')}</span>
            <span className={b('value-label-item')}>
                {dateTimeParse(value?.end?.value, {timeZone, roundUp: true})?.format(format)}
            </span>
            {timeZone && <span className={b('value-label-tz')}>{timeZone}</span>}
        </div>
    );
}
