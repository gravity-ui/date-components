'use client';

import {dateTime} from '@gravity-ui/date-utils';
import {Button, Popup, Sheet} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {RelativeDatePicker} from '../../../RelativeDatePicker';
import type {RelativeDatePickerProps} from '../../../RelativeDatePicker';
import type {RelativeRangeDatePickerState} from '../../hooks/useRelativeRangeDatePickerState';
import type {RelativeRangeDatePickerProps} from '../../types';
import {Presets} from '../Presets/Presets';
import {Zones} from '../Zones/Zones';

import {i18n} from './i18n';
import {useRelativeRangeDatePickerDialogState} from './useRelativeRangeDatePickerDialogState';

import './PickerDialog.scss';

const b = block('relative-range-date-picker-dialog');

export interface PickerDialogProps {
    className?: string;
    state: RelativeRangeDatePickerState;
    props: RelativeRangeDatePickerProps;
    open: boolean;
    isMobile?: boolean;
    anchorRef?: React.RefObject<HTMLElement>;
    onClose: () => void;
    focusInput?: () => void;
    disableFocusTrap?: boolean;
}

export function PickerDialog({
    props,
    state,
    open,
    onClose,
    focusInput,
    isMobile,
    anchorRef,
    className,
    disableFocusTrap,
}: PickerDialogProps) {
    if (isMobile) {
        return (
            <Sheet
                visible={open}
                onClose={onClose}
                contentClassName={b('content', {mobile: true, size: 'xl'}, className)}
            >
                <DialogContent {...props} size="xl" state={state} onApply={onClose} />
            </Sheet>
        );
    }

    return (
        <Popup
            open={open}
            onEscapeKeyDown={() => {
                onClose();
                focusInput?.();
            }}
            onClose={onClose}
            role="dialog"
            anchorRef={anchorRef}
            contentClassName={b('content', {size: props.size}, className)}
            autoFocus={!disableFocusTrap}
            focusTrap={!disableFocusTrap}
        >
            <DialogContent {...props} state={state} onApply={onClose} />
        </Popup>
    );
}

function DialogContent(
    props: {
        state: RelativeRangeDatePickerState;
        onApply: () => void;
    } & RelativeRangeDatePickerProps,
) {
    const state = useRelativeRangeDatePickerDialogState(props.state, props);

    const placeholderValue =
        props.placeholderValue?.timeZone(props.state.timeZone) ||
        dateTime({timeZone: props.state.timeZone});
    const fieldProps: RelativeDatePickerProps = {
        timeZone: props.state.timeZone,
        format: props.format,
        minValue: props.minValue,
        maxValue: props.maxValue,
        hasClear: props.allowNullableValues,
        readOnly: props.readOnly,
        size: props.size,
        errorPlacement: 'inside',
    };
    return (
        <div>
            <div className={b('pickers')}>
                <RelativeDatePicker
                    {...fieldProps}
                    validationState={state.startValidation?.isInvalid ? 'invalid' : undefined}
                    errorMessage={
                        state.startValidation?.errors?.join('\n') || i18n('Value is incorrect.')
                    }
                    placeholderValue={placeholderValue.startOf('day')}
                    label={i18n('From')}
                    value={state.start}
                    onUpdate={state.setStart}
                />
                <RelativeDatePicker
                    {...fieldProps}
                    validationState={state.endValidation?.isInvalid ? 'invalid' : undefined}
                    errorMessage={
                        state.endValidation?.errors?.join('\n') || i18n('Value is incorrect.')
                    }
                    placeholderValue={placeholderValue.endOf('day')}
                    label={i18n('To')}
                    value={state.end}
                    onUpdate={state.setEnd}
                    roundUp
                />
            </div>
            {props.withApplyButton && !props.readOnly ? (
                <Button
                    disabled={state.isInvalid}
                    size={props.size}
                    onClick={() => {
                        state.applyValue();
                        props.onApply();
                    }}
                    className={b('apply')}
                    width="max"
                >
                    {i18n('Apply')}
                </Button>
            ) : null}
            {props.withPresets && !props.readOnly ? (
                <Presets
                    size={props.size}
                    presetTabs={props.presetTabs}
                    onChoosePreset={(start, end) => {
                        state.setRange(
                            {type: 'relative', value: start},
                            {type: 'relative', value: end},
                        );
                        if (!props.withApplyButton) {
                            props.onApply();
                        }
                    }}
                    minValue={props.minValue}
                    docs={props.docs}
                    className={b('presets')}
                />
            ) : null}
            {props.withZonesList ? (
                <div className={b('zone')}>
                    <Zones
                        value={state.timeZone}
                        onUpdate={state.setTimeZone}
                        disabled={props.readOnly}
                        size={props.size}
                    />
                </div>
            ) : null}
        </div>
    );
}
