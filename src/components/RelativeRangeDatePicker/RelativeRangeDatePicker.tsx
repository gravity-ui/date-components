'use client';

import React from 'react';

import {useControlledState, useFocusWithin, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import type {Value} from '../RelativeDatePicker';

import {Control} from './components/Control/Control';
import {PickerDialog} from './components/PickerDialog/PickerDialog';
import {useRelativeRangeDatePickerState} from './hooks/useRelativeRangeDatePickerState';
import type {RelativeRangeDatePickerProps} from './types';

import './RelativeRangeDatePicker.scss';

const b = block('relative-range-date-picker');

export function RelativeRangeDatePicker(props: RelativeRangeDatePickerProps) {
    const state = useRelativeRangeDatePickerState(props);

    const isMobile = useMobile();

    const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [isActive, setIsActive] = React.useState(false);
    const [open, setOpen] = useControlledState<boolean>(undefined, false, props.onOpenChange);

    const {focusWithinProps} = useFocusWithin({
        isDisabled: props.disabled,
        onFocusWithin: (e) => {
            if (!isActive) {
                props.onFocus?.(e);
            }
        },
        onBlurWithin: (e) => {
            if (!open) {
                setIsActive(false);
                props.onBlur?.(e);
            }
        },
    });

    return (
        <div
            ref={setAnchor}
            {...focusWithinProps}
            className={b(null, props.className)}
            style={props.style}
        >
            <Control
                props={props}
                state={state}
                open={open}
                isMobile={isMobile}
                ref={inputRef}
                onClick={() => {
                    if (props.disabled) {
                        return;
                    }
                    if (!open) {
                        setIsActive(true);
                        setOpen(true);
                    }
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
                onClickCalendar={() => {
                    setIsActive(true);
                    setOpen(!open);
                }}
                onFocus={() => {
                    if (!isActive) {
                        setIsActive(true);
                        setOpen(true);
                    }
                }}
                onUpdate={(v: string) => {
                    if (!props.readOnly && !v) {
                        state.setValue(null, 'default');
                    }
                }}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                value={state.value}
                toStringValue={(v) => v?.start?.type ?? ''}
                disabled={props.disabled}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                value={state.value}
                toStringValue={(v) => getNativeValue(v?.start ?? null)}
                disabled={props.disabled}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                value={state.value}
                toStringValue={(v) => v?.end?.type ?? ''}
                disabled={props.disabled}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                value={state.value}
                toStringValue={(v) => getNativeValue(v?.end ?? null)}
                disabled={props.disabled}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                onReset={(v) => {
                    state.setValue(v.value, v.timeZone);
                }}
                value={{value: state.value, timeZone: state.timeZone}}
                toStringValue={(v) => v.timeZone}
                disabled={props.disabled}
            />

            <PickerDialog
                value={state.value}
                onUpdate={state.setValue}
                timeZone={state.timeZone}
                open={open}
                onClose={(reason) => {
                    setOpen(false);
                    if (reason === 'escape-key') {
                        setTimeout(() => {
                            inputRef.current?.focus({preventScroll: true});
                        });
                    }
                }}
                anchor={anchor}
                modal
                popupClassName={props.popupClassName}
                popupStyle={props.popupStyle}
                popupPlacement={props.popupPlacement}
                popupOffset={props.popupOffset}
                isMobile={isMobile}
                size={props.size}
                format={props.format}
                readOnly={props.readOnly}
                minValue={props.minValue}
                maxValue={props.maxValue}
                allowNullableValues={props.allowNullableValues}
                isDateUnavailable={props.isDateUnavailable}
                placeholderValue={props.placeholderValue}
                withPresets={props.withPresets}
                presetTabs={props.presetTabs}
                docs={props.docs}
                withApplyButton={props.withApplyButton}
                withZonesList={props.withZonesList}
                withHeader={props.withHeader}
            />
        </div>
    );
}

function getNativeValue(value: Value | null) {
    if (!value) {
        return '';
    }
    if (value.type === 'relative') {
        return value.value;
    }
    return value.value.toISOString();
}
