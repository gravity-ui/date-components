import React from 'react';

import {Popup, Sheet, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {pick} from '../../utils/pick';
import {useControlledState} from '../hooks/useControlledState';

import {RelativeRangeDatePickerEditor, RelativeRangeDatePickerLabel} from './components';
import {useRelativeRangeDatePickerValue} from './hooks';
import type {RelativeRangeDatepickerProps} from './types';
import {getDefaultPresetTabs, getFieldProps} from './utils';

import './RelativeRangeDatePicker.scss';

const b = block('relative-range-date-picker');

export function RelativeRangeDatePicker(props: RelativeRangeDatepickerProps) {
    const {
        value: propsValue,
        onUpdate,
        withApplyButton,
        disabled,
        timeZone: propsTimeZone,
        withZonesList,
    } = props;

    const [isMobile] = useMobile();

    const propsValueRef = React.useRef(propsValue);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const calendarButtonRef = React.useRef<HTMLButtonElement>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const [opened, setOpened] = useControlledState(props.open, false, props.onOpenChange);
    const [timeZone, setTimeZone] = React.useState(propsTimeZone);

    React.useEffect(() => {
        if (!withZonesList) {
            setTimeZone(propsTimeZone);
        }
    }, [propsTimeZone]);

    const [value, setValue, {startError, endError}] = useRelativeRangeDatePickerValue({
        ...pick(props, 'value', 'timeZone', 'minValue', 'maxValue', 'allowNullableValues'),
        onUpdate: withApplyButton ? undefined : onUpdate,
    });
    propsValueRef.current = propsValue || value;
    const isValid = !startError && !endError;

    React.useEffect(() => {
        setTimeZone(propsTimeZone);
    }, [propsTimeZone]);

    React.useEffect(() => {
        setOpened(false);
    }, [disabled]);

    function renderPopupContent() {
        return (
            <RelativeRangeDatePickerEditor
                {...getFieldProps({...props, timeZone})}
                {...pick(props, 'withPresets', 'withZonesList', 'placeholderValue')}
                onApply={() => {
                    onUpdate?.(value);
                }}
                isValid={isValid}
                withApplyButton={withApplyButton}
                onUpdateTimeZone={(timeZone) => {
                    setTimeZone(timeZone);
                    props.onUpdateTimeZone?.(timeZone);
                }}
                startError={startError}
                endError={endError}
                presetTabs={props.presetTabs || getDefaultPresetTabs(props.withTimePresets)}
                value={value}
                onUpdate={setValue}
            />
        );
    }

    function focusInput() {
        inputRef.current?.focus();
    }

    return (
        <div ref={containerRef} className={b()}>
            {props.customControl || (
                <RelativeRangeDatePickerLabel
                    {...pick(
                        props,
                        'disabled',
                        'format',
                        'size',
                        'hasClear',
                        'pin',
                        'view',
                        'label',
                        'placeholder',
                        'errorMessage',
                        'validationState',
                        'alwaysShowAsAbsolute',
                        'autoFocus',
                    )}
                    style={props.style}
                    errorPlacement={props.errorPlacement}
                    errorMessage={startError || endError || props.errorMessage}
                    validationState={props.validationState}
                    value={value}
                    isOpen={!!opened}
                    onOpenChange={() => {
                        setOpened((prevIsOpen) => !prevIsOpen);
                    }}
                    inputRef={inputRef}
                    calendarButtonRef={calendarButtonRef}
                    onClear={() => {
                        setValue({start: null, end: null});
                    }}
                />
            )}
            {isMobile ? (
                <Sheet
                    visible={!!opened}
                    onClose={() => {
                        setOpened((prevIsOpen) => !prevIsOpen);
                    }}
                >
                    {renderPopupContent()}
                </Sheet>
            ) : (
                <div ref={anchorRef} className={b('popup-anchor')}>
                    <Popup
                        anchorRef={anchorRef}
                        open={opened}
                        onEscapeKeyDown={() => {
                            setOpened(false);
                            focusInput();
                        }}
                        onOutsideClick={(e) => {
                            if (e.target !== calendarButtonRef.current) {
                                setOpened(false);
                            }
                            if (e.target && containerRef.current?.contains(e.target as Node)) {
                                focusInput();
                            }
                        }}
                    >
                        {renderPopupContent()}
                    </Popup>
                </div>
            )}
        </div>
    );
}
