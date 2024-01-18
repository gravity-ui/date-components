import React from 'react';

import {guessUserTimeZone} from '@gravity-ui/date-utils';
import {Popup, Sheet, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {pick} from '../../utils/pick';
import {useControlledState} from '../hooks/useControlledState';

import {RelativeRangeDatePickerEditor, RelativeRangeDatePickerLabel} from './components';
import {useRelativeDatePickerValue} from './hooks';
import type {RelativeRangeDatepickerProps} from './types';
import {getDefaultPresetTabs, getErrors, getFieldProps, isValueEqual} from './utils';

import './RelativeRangeDatePicker.scss';
export const b = block('relative-range-date-picker');

export function RelativeRangeDatePicker(props: RelativeRangeDatepickerProps) {
    const {minValue, maxValue, value: propsValue, onUpdate, withApplyButton} = props;

    const [isMobile] = useMobile();

    const propsValueRef = React.useRef(propsValue);
    propsValueRef.current = propsValue;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const calendarButtonRef = React.useRef<HTMLButtonElement>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const [isOpen, setOpen] = React.useState(false);
    const [timeZone, setTimeZone] = useControlledState(
        props.timeZone,
        guessUserTimeZone(),
        props.onUpdateTimeZone,
    );
    const [value, setValue] = useRelativeDatePickerValue(pick(props, 'value', 'timeZone'));
    const {startError, endError} = getErrors({value, minValue, maxValue});
    const isValid = !startError && !endError;

    React.useEffect(() => {
        if (isValid && !withApplyButton && !isValueEqual(propsValueRef.current, value)) {
            onUpdate?.(value || null);
        }
    }, [isValid, value, withApplyButton]);

    function renderPopupContent() {
        return (
            <RelativeRangeDatePickerEditor
                {...getFieldProps({...props, timeZone})}
                hasClear={props.hasClear}
                onApply={() => {
                    onUpdate?.(value);
                }}
                isValid={isValid}
                withApplyButton={withApplyButton}
                onUpdateTimeZone={setTimeZone}
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
                )}
                errorPlacement={props.errorPlacement}
                errorMessage={startError || endError}
                value={value}
                isOpen={isOpen}
                onOpenChange={() => {
                    setOpen((prevIsOpen) => !prevIsOpen);
                }}
                inputRef={inputRef}
                calendarButtonRef={calendarButtonRef}
                onClear={() => {
                    setValue({start: null, end: null});
                }}
            />
            {isMobile ? (
                <Sheet
                    visible={isOpen}
                    onClose={() => {
                        setOpen((prevIsOpen) => !prevIsOpen);
                    }}
                >
                    {renderPopupContent()}
                </Sheet>
            ) : (
                <div ref={anchorRef} className={b('popup-anchor')}>
                    <Popup
                        anchorRef={anchorRef}
                        open={isOpen}
                        onEscapeKeyDown={() => {
                            setOpen(false);
                            focusInput();
                        }}
                        onOutsideClick={(e) => {
                            if (e.target !== calendarButtonRef.current) {
                                setOpen(false);
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
