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

export function RangeDatePickerEditor(props: Props) {
    const {value, onUpdate} = props;

    function handleUpdate(
        key: keyof RangeDatepickerValue,
        singleValue: RangeDatepickerSingleValue | null,
    ) {
        let newValue: RangeDatepickerValue = {
            start: value?.start || null,
            end: value?.end || null,
            [key]: singleValue || null,
        };

        if (isNeededToFlipValue(newValue)) {
            newValue = getFlippedValue(key, newValue);
        }

        onUpdate(newValue);
    }

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
                    onUpdate={(newValue) => {
                        handleUpdate('start', newValue);
                    }}
                    hasClear={props.hasClear}
                />
                <RelativeDatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('To')}:`}
                    value={value?.end}
                    className={b('field')}
                    onUpdate={(newValue) => {
                        handleUpdate('end', newValue);
                    }}
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
                    onUpdate={(newValue) => {
                        handleUpdate(
                            'start',
                            newValue ? {type: 'absolute', value: newValue} : null,
                        );
                    }}
                    hasClear={props.hasClear}
                />
                <DatePicker
                    {...baseDatePickerProps}
                    label={`${i18n('To')}:`}
                    value={value ? getDateTimeFromSingleValue(value.end) : value}
                    className={b('field')}
                    onUpdate={(newValue) => {
                        handleUpdate('end', newValue ? {type: 'absolute', value: newValue} : null);
                    }}
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
                onUpdatePreset={(start: string, end: string) => {
                    onUpdate({
                        start: {type: 'relative', value: start},
                        end: {type: 'relative', value: end},
                    });
                }}
            />
        </div>
    );
}
