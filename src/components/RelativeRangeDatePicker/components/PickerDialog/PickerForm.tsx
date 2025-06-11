'use client';

import type {DateTime} from '@gravity-ui/date-utils';
import {Button, Text} from '@gravity-ui/uikit';
import type {TextInputSize} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import {RelativeDatePicker} from '../../../RelativeDatePicker';
import type {RelativeDatePickerProps} from '../../../RelativeDatePicker';
import type {DomProps, StyleProps} from '../../../types';
import type {RelativeRangeDatePickerStateOptions} from '../../hooks/useRelativeRangeDatePickerState';
import {Presets} from '../Presets/Presets';
import type {Preset} from '../Presets/defaultPresets';
import type {PresetTab} from '../Presets/utils';
import {Zones} from '../Zones/Zones';

import {PickerDoc} from './PickerDoc';
import {i18n} from './i18n';
import {useRelativeRangeDatePickerDialogState} from './useRelativeRangeDatePickerDialogState';

import './PickerForm.scss';

const b = block('relative-range-date-picker-form');

export interface PickerFormProps extends RelativeRangeDatePickerStateOptions, DomProps, StyleProps {
    /** The size of the element */
    size?: TextInputSize;
    /**
     * Whether the values is immutable.
     * @default false
     */
    readOnly?: boolean;
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
    /** Show header with docs tooltip */
    withHeader?: boolean;
    /** Custom preset tabs */
    presetTabs?: PresetTab[];
    /** Custom docs for picker, if empty array docs will be hidden */
    docs?: Preset[];
}

export function PickerForm(
    props: PickerFormProps & {
        onApply: () => void;
    },
) {
    const state = useRelativeRangeDatePickerDialogState(props);

    const fieldProps: RelativeDatePickerProps = {
        timeZone: state.timeZone,
        format: props.format,
        minValue: props.minValue,
        maxValue: props.maxValue,
        hasClear: props.allowNullableValues,
        readOnly: props.readOnly,
        size: props.size,
        errorPlacement: 'inside',
    };
    const {isDateUnavailable, withHeader = false} = props;
    return (
        <div className={b({size: props.size}, props.className)} style={props.style}>
            {withHeader && (
                <div className={b('header')}>
                    <Text variant={props.size === 'xl' ? 'subheader-3' : 'subheader-2'}>
                        {i18n('Select the interval')}
                    </Text>
                    <PickerDoc
                        size={props.size}
                        docs={props.docs}
                        onStartUpdate={(start) => {
                            state.setStart(
                                start === null ? null : {type: 'relative', value: start},
                            );
                        }}
                        onEndUpdate={(end) => {
                            state.setEnd(end === null ? null : {type: 'relative', value: end});
                        }}
                    />
                </div>
            )}

            <div className={b('pickers')}>
                <RelativeDatePicker
                    {...fieldProps}
                    isDateUnavailable={
                        isDateUnavailable ? (date) => isDateUnavailable(date, 'start') : undefined
                    }
                    validationState={state.startValidation?.isInvalid ? 'invalid' : undefined}
                    errorMessage={
                        state.startValidation?.errors?.join('\n') || i18n('Value is incorrect.')
                    }
                    placeholderValue={props.placeholderValue?.startOf('day')}
                    label={i18n('From')}
                    value={state.start}
                    onUpdate={state.setStart}
                />
                <RelativeDatePicker
                    {...fieldProps}
                    isDateUnavailable={
                        isDateUnavailable ? (date) => isDateUnavailable(date, 'end') : undefined
                    }
                    validationState={state.endValidation?.isInvalid ? 'invalid' : undefined}
                    errorMessage={
                        state.endValidation?.errors?.join('\n') || i18n('Value is incorrect.')
                    }
                    placeholderValue={props.placeholderValue?.endOf('day')}
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
                            start === null ? null : {type: 'relative', value: start},
                            end === null ? null : {type: 'relative', value: end},
                        );
                        if (!props.withApplyButton) {
                            props.onApply();
                        }
                    }}
                    minValue={props.minValue}
                    allowNullableValues={props.allowNullableValues}
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
