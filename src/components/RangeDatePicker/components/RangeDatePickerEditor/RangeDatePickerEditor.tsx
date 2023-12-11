import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import {block} from '../../../../utils/cn';
import {DatePicker} from '../../../DatePicker';
import {RelativeDatePicker} from '../../../RelativeDatePicker';
import type {DateFieldBase} from '../../../types';
import type {
    RangeDatepickerPresetTab,
    RangeDatepickerSingleValue,
    RangeDatepickerValue,
} from '../../types';
import {getFieldProps} from '../../utils/getFieldProps';

import {RangeDatePickerPresets} from './components/RangeDatePickerPresets';
import {i18n} from './i18n';
import {getDateTimeFromSingleValue} from './utils/getDateTimeFromSingleValue';
import {getFlippedValue} from './utils/getFlippedValue';
import {isNeededToFlipValue} from './utils/isNeededToFlipValue';

import './RangeDatePickerEditor.scss';

export const b = block('range-date-picker-editor');

interface Props extends DateFieldBase<RangeDatepickerValue> {
    value: RangeDatepickerValue | null | undefined;
    onUpdate: (value: RangeDatepickerValue | null) => void;
    presetTabs: RangeDatepickerPresetTab[];

    hasClear?: boolean;
    alwaysShowAsAbsolute?: boolean;
}

export const RangeDatePickerEditor = (props: Props) => {
    const {value, onUpdate} = props;

    const handleUpdate = React.useCallback(
        (key: keyof RangeDatepickerValue, singleValue: RangeDatepickerSingleValue | null) => {
            let newValue: RangeDatepickerValue = {
                start: value?.start || null,
                end: value?.end || null,
                [key]: singleValue || null,
            };

            if (isNeededToFlipValue(newValue)) {
                newValue = getFlippedValue(key, newValue);
            }

            onUpdate(newValue);
        },
        [value, onUpdate],
    );

    const handleChangePreset = React.useCallback(
        (start: string, end: string) => {
            onUpdate({
                start: {type: 'relative', value: start},
                end: {type: 'relative', value: end},
            });
        },
        [onUpdate],
    );

    const handleUpdateStart = React.useMemo(
        () => handleUpdate.bind(handleUpdate, 'start'),
        [handleUpdate],
    );

    const handleUpdateEnd = React.useMemo(
        () => handleUpdate.bind(handleUpdate, 'end'),
        [handleUpdate],
    );

    const handleUpdateAbsoluteStart = React.useCallback(
        (newValue: DateTime | null) => {
            return handleUpdateStart(newValue ? {type: 'absolute', value: newValue} : null);
        },
        [handleUpdateStart],
    );

    const handleUpdateAbsoluteEnd = React.useCallback(
        (newValue: DateTime | null) => {
            return handleUpdateEnd(newValue ? {type: 'absolute', value: newValue} : null);
        },
        [handleUpdateEnd],
    );

    const baseDatePickerProps = {
        ...getFieldProps(props),
        className: b('field'),
        hasClear: props.hasClear,
    };

    function renderRelative() {
        return (
            <div className={b('fields')}>
                <RelativeDatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('From')}:`}
                    value={value?.start}
                    className={b('field')}
                    onUpdate={handleUpdateStart}
                    hasClear={props.hasClear}
                />
                <RelativeDatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('To')}:`}
                    value={value?.end}
                    className={b('field')}
                    onUpdate={handleUpdateEnd}
                    hasClear={props.hasClear}
                />
            </div>
        );
    }

    function renderAbsolute() {
        return (
            <div className={b('fields')}>
                <DatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('From')}:`}
                    value={value ? getDateTimeFromSingleValue(value.start) : value}
                    className={b('field')}
                    onUpdate={handleUpdateAbsoluteStart}
                    hasClear={props.hasClear}
                />
                <DatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('To')}:`}
                    value={value ? getDateTimeFromSingleValue(value.end) : value}
                    className={b('field')}
                    onUpdate={handleUpdateAbsoluteEnd}
                    hasClear={props.hasClear}
                />
            </div>
        );
    }

    return (
        <div className={b()}>
            {props.alwaysShowAsAbsolute ? renderAbsolute() : renderRelative()}
            <RangeDatePickerPresets
                value={value}
                presetTabs={props.presetTabs}
                onUpdatePreset={handleChangePreset}
            />
        </div>
    );
};
