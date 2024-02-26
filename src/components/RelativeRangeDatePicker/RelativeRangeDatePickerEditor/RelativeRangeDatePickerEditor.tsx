import {Button, useMobile} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {RelativeDatePicker, type RelativeDatePickerProps} from '../../RelativeDatePicker';
import type {DateFieldBase} from '../../types';
import type {
    RelativeRangeDatepickerPresetTab,
    RelativeRangeDatepickerSingleValue,
    RelativeRangeDatepickerValue,
} from '../types';
import {getFieldProps} from '../utils';

import {RelativeRangeDatePickerPresets} from './RelativeRangeDatePickerPresets';
import {RelativeRangeDatePickerZones} from './RelativeRangeDatePickerZones';
import {i18n} from './i18n';

import './RelativeRangeDatePickerEditor.scss';

export const b = block('relative-range-date-picker-editor');

interface Props extends DateFieldBase<RelativeRangeDatepickerValue> {
    value: RelativeRangeDatepickerValue | null | undefined;
    onUpdate: (value: RelativeRangeDatepickerValue | null) => void;
    presetTabs: RelativeRangeDatepickerPresetTab[];
    onUpdateTimeZone: (timeZone: string | undefined) => void;
    isValid: boolean;

    withZonesList?: boolean;
    withPresets?: boolean;
    withApplyButton?: boolean;
    onApply?: () => void;
    startError?: string;
    endError?: string;
}

export function RelativeRangeDatePickerEditor(props: Props) {
    const {value, onUpdate} = props;

    const [mobile] = useMobile();

    function handleUpdate(
        key: keyof RelativeRangeDatepickerValue,
        singleValue: RelativeRangeDatepickerSingleValue | null,
    ) {
        const newValue: RelativeRangeDatepickerValue = {
            start: value?.start || null,
            end: value?.end || null,
            [key]: singleValue || null,
        };

        onUpdate(newValue);
    }

    const baseDatePickerProps: Omit<RelativeDatePickerProps, 'defaultValue'> = {
        ...getFieldProps(props),
        className: b('field'),
        timeZone: props.timeZone,
        hasClear: true,
        size: mobile ? 'xl' : undefined,
        errorPlacement: 'inside',
    };

    return (
        <div
            className={b({
                platform: mobile ? 'mobile' : 'desktop',
                withPresets: props.withPresets,
            })}
        >
            <div className={b('fields')}>
                <RelativeDatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('From')}:`}
                    errorMessage={props.startError}
                    validationState={props.startError ? 'invalid' : undefined}
                    value={value?.start || null}
                    onUpdate={(newValue) => {
                        handleUpdate('start', newValue);
                    }}
                />
                <RelativeDatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('To')}:`}
                    errorMessage={props.endError}
                    validationState={props.endError ? 'invalid' : undefined}
                    value={value?.end || null}
                    onUpdate={(newValue) => {
                        handleUpdate('end', newValue);
                    }}
                />
                {props.withApplyButton ? (
                    <Button
                        disabled={!props.isValid}
                        onClick={props.onApply}
                        className={b('apply')}
                    >
                        {i18n('Apply')}
                    </Button>
                ) : null}
            </div>
            {props.withPresets ? (
                <RelativeRangeDatePickerPresets
                    value={value}
                    minValue={props.minValue}
                    presetTabs={props.presetTabs}
                    onUpdatePreset={(start: string, end: string) => {
                        onUpdate({
                            start: {type: 'relative', value: start},
                            end: {type: 'relative', value: end},
                        });
                    }}
                />
            ) : null}
            {props.withZonesList ? (
                <RelativeRangeDatePickerZones
                    onUpdate={props.onUpdateTimeZone}
                    timeZone={props.timeZone}
                />
            ) : null}
        </div>
    );
}
