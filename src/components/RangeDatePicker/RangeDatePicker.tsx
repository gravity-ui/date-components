import React from 'react';

import {Popup, Sheet, useMobile} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {pick} from '../../utils/pick';
import {useControlledState} from '../hooks/useControlledState';

import {RangeDatePickerEditor} from './components/RangeDatePickerEditor';
import {RangeDatePickerLabel} from './components/RangeDatePickerLabel';
import {useDefaultPresetTabs} from './hooks';
import type {RangeDatepickerProps} from './types';
import {getFieldProps} from './utils/getFieldProps';

import './RangeDatePicker.scss';

export const b = block('range-date-picker');

export const RangeDatePicker = (props: RangeDatepickerProps) => {
    const defaultPresetTabs = useDefaultPresetTabs(props.withTime);
    const {presetTabs = defaultPresetTabs} = props;

    const [isMobile] = useMobile();

    const containerRef = React.useRef<HTMLDivElement>(null);
    const calendarButtonRef = React.useRef<HTMLButtonElement>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const [isOpen, setOpen] = React.useState(false);

    const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onUpdate);

    const handleOpenChange = React.useCallback(() => {
        setOpen((prevIsOpen) => !prevIsOpen);
    }, []);

    function focusCalendar() {
        setTimeout(() => {
            calendarButtonRef?.current?.focus();
        });
    }

    const handleEscapeKeyDown = React.useCallback(() => {
        setOpen(false);
        focusCalendar();
    }, []);

    const handleOutsideClick = React.useCallback((e: MouseEvent) => {
        if (e.target !== calendarButtonRef.current) {
            setOpen(false);
        }
        if (e.target && containerRef.current?.contains(e.target as Node)) {
            focusCalendar();
        }
    }, []);

    function renderPopupContent() {
        return (
            <RangeDatePickerEditor
                {...getFieldProps(props)}
                {...pick(props, 'alwaysShowAsAbsolute', 'hasClear')}
                presetTabs={presetTabs}
                value={value}
                onUpdate={setValue}
            />
        );
    }

    const handleClear = React.useCallback(() => {
        setValue({start: null, end: null});
    }, [setValue]);

    return (
        <div ref={containerRef} className={b()}>
            <RangeDatePickerLabel
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
                onOpenChange={handleOpenChange}
                calendarButtonRef={calendarButtonRef}
                onClear={handleClear}
            />
            {isMobile ? (
                <Sheet visible={isOpen} onClose={handleOpenChange}>
                    {renderPopupContent()}
                </Sheet>
            ) : (
                <div ref={anchorRef} className={b('popup-anchor')}>
                    <Popup
                        anchorRef={anchorRef}
                        open={isOpen}
                        onEscapeKeyDown={handleEscapeKeyDown}
                        onOutsideClick={handleOutsideClick}
                    >
                        {renderPopupContent()}
                    </Popup>
                </div>
            )}
        </div>
    );
};
