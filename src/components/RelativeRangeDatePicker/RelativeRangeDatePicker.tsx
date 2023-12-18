import React from 'react';

import {Popup, Sheet, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {pick} from '../../utils/pick';
import {useControlledState} from '../hooks/useControlledState';

import {RelativeRangeDatePickerEditor} from './components/RelativeRangeDatePickerEditor';
import {RelativeRangeDatePickerLabel} from './components/RelativeRangeDatePickerLabel';
import type {RelativeRangeDatepickerProps} from './types';
import {getDefaultPresetTabs} from './utils/getDefaultPresetTabs';
import {getFieldProps} from './utils/getFieldProps';

import './RelativeRangeDatePicker.scss';

export const b = block('relative-range-date-picker');

export function RelativeRangeDatePicker(props: RelativeRangeDatepickerProps) {
    const {presetTabs = getDefaultPresetTabs(props.withTime)} = props;

    const [isMobile] = useMobile();

    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const calendarButtonRef = React.useRef<HTMLButtonElement>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const [isOpen, setOpen] = React.useState(false);

    const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onUpdate);

    function focusInput() {
        setTimeout(() => {
            inputRef?.current?.focus();
        });
    }

    function renderPopupContent() {
        return (
            <RelativeRangeDatePickerEditor
                {...getFieldProps(props)}
                {...pick(props, 'alwaysShowAsAbsolute', 'hasClear')}
                presetTabs={presetTabs}
                value={value}
                onUpdate={setValue}
            />
        );
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
